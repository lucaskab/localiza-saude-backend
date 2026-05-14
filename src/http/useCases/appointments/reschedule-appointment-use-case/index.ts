import { prisma } from "@/database/prisma";
import type { AppointmentWithRelations } from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import { googleMeetService } from "@/http/services/google-meet-service";
import { recurringAppointmentsService } from "@/http/services/recurring-appointments";
import type { user } from "../../../../../prisma/generated/prisma/client";

type RescheduleAppointmentData = {
	scheduledAt: Date;
	reason?: string | null;
};

type RespondToRescheduleRequestData = {
	action: "ACCEPT" | "DECLINE";
};

const reschedulableStatuses = ["SCHEDULED", "CONFIRMED"] as const;

function timeToMinutes(date: Date) {
	return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function scheduleTimeToMinutes(time: string) {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

function hasDateOverlap(
	startA: Date,
	endA: Date,
	startB: Date,
	endB: Date,
) {
	return startA < endB && endA > startB;
}

function assertCanChangeAppointment(appointment: AppointmentWithRelations) {
	if (!reschedulableStatuses.includes(appointment.status as never)) {
		throw new BadRequestError(
			"Only scheduled or confirmed appointments can be rescheduled",
		);
	}
}

function isCustomerParticipant(
	currentUser: user,
	appointment: AppointmentWithRelations,
) {
	return (
		appointment.customerId === currentUser.id ||
		appointment.patientProfile?.customerOwnerId === currentUser.id
	);
}

function isProviderParticipant(
	currentUser: user,
	appointment: AppointmentWithRelations,
) {
	return appointment.healthcareProviderId === currentUser.id;
}

async function assertAvailableScheduledAt({
	appointment,
	scheduledAt,
}: {
	appointment: AppointmentWithRelations;
	scheduledAt: Date;
}) {
	if (Number.isNaN(scheduledAt.getTime())) {
		throw new BadRequestError("Invalid scheduled date");
	}

	const schedule = await prisma.healthcare_provider_schedule.findFirst({
		where: {
			healthcareProviderId: appointment.healthcareProviderId,
			dayOfWeek: scheduledAt.getUTCDay(),
			isActive: true,
		},
	});

	if (!schedule) {
		throw new BadRequestError(
			"Healthcare provider is not available on the selected date",
		);
	}

	const scheduledAtMinutes = timeToMinutes(scheduledAt);
	const startMinutes = scheduleTimeToMinutes(schedule.startTime);
	const endMinutes = scheduleTimeToMinutes(schedule.endTime);
	const appointmentEndMinutes =
		scheduledAtMinutes + appointment.totalDurationMinutes;

	if (scheduledAtMinutes < startMinutes || appointmentEndMinutes > endMinutes) {
		throw new BadRequestError(
			"Selected time is outside the provider working hours",
		);
	}

	const provider = await prisma.user.findUnique({
		where: {
			id: appointment.healthcareProviderId,
		},
		select: {
			bookingAvailabilityDays: true,
		},
	});

	recurringAppointmentsService.assertScheduledAtWithinBookingWindow(
		provider?.bookingAvailabilityDays,
		scheduledAt,
	);
	await recurringAppointmentsService.ensureProviderRecurringAppointmentsUpToDate(
		appointment.healthcareProviderId,
		scheduledAt,
	);

	const startOfDay = new Date(scheduledAt);
	startOfDay.setUTCHours(0, 0, 0, 0);
	const endOfDay = new Date(scheduledAt);
	endOfDay.setUTCHours(23, 59, 59, 999);

	const existingAppointments =
		await prismaAppointmentRepository.findByProfessionalAndDateRange(
			appointment.healthcareProviderId,
			{
				startDate: startOfDay,
				endDate: endOfDay,
			},
		);

	const proposedEnd = new Date(
		scheduledAt.getTime() + appointment.totalDurationMinutes * 60 * 1000,
	);
	const hasConflict = existingAppointments.some((existingAppointment) => {
		if (existingAppointment.id === appointment.id) {
			return false;
		}

		const existingStart = new Date(existingAppointment.scheduledAt);
		const existingEnd = new Date(
			existingStart.getTime() +
				existingAppointment.totalDurationMinutes * 60 * 1000,
		);

		return hasDateOverlap(scheduledAt, proposedEnd, existingStart, existingEnd);
	});

	if (hasConflict) {
		throw new BadRequestError(
			"This time slot is no longer available for this provider",
		);
	}
}

async function applyReschedule({
	appointment,
	scheduledAt,
}: {
	appointment: AppointmentWithRelations;
	scheduledAt: Date;
}) {
	let updatedAppointment = await prismaAppointmentRepository.update(
		appointment.id,
		{
			scheduledAt,
			onlineMeetingUrl: null,
			onlineMeetingProvider: null,
			onlineMeetingExternalId: null,
			onlineMeetingCreatedAt: null,
		},
	);

	if (updatedAppointment.status === "CONFIRMED") {
		updatedAppointment = await googleMeetService
			.ensureOnlineMeeting(updatedAppointment)
			.catch((error) => {
				console.error("Failed to create Google Meet link:", error);
				return updatedAppointment;
			});
	}

	return updatedAppointment;
}

export const rescheduleAppointmentUseCase = {
	async request(
		appointmentId: string,
		currentUser: user,
		data: RescheduleAppointmentData,
	): Promise<{ appointment: AppointmentWithRelations }> {
		const appointment = await prismaAppointmentRepository.findById(appointmentId);

		if (!appointment) {
			throw new BadRequestError("Appointment not found");
		}

		assertCanChangeAppointment(appointment);

		const isCustomer = isCustomerParticipant(currentUser, appointment);
		const isProvider =
			isProviderParticipant(currentUser, appointment) ||
			(await clinicRbac.canManageProvider(
				currentUser,
				appointment.healthcareProviderId,
				"MANAGE_APPOINTMENTS",
			));

		if (!isCustomer && !isProvider) {
			throw new UnauthorizedError("You cannot reschedule this appointment");
		}

		await assertAvailableScheduledAt({
			appointment,
			scheduledAt: data.scheduledAt,
		});

		const hasCustomerToRespond = Boolean(
			appointment.customerId || appointment.patientProfile?.customerOwnerId,
		);

		if (isCustomer || !hasCustomerToRespond) {
			const updatedAppointment = await applyReschedule({
				appointment,
				scheduledAt: data.scheduledAt,
			});

			return { appointment: updatedAppointment };
		}

		await prisma.appointment_reschedule_request.updateMany({
			where: {
				appointmentId: appointment.id,
				status: "PENDING",
			},
			data: {
				status: "CANCELLED",
				respondedAt: new Date(),
			},
		});

		await prisma.appointment_reschedule_request.create({
			data: {
				appointmentId: appointment.id,
				requestedByUserId: currentUser.id,
				proposedScheduledAt: data.scheduledAt,
				reason: data.reason?.trim() || null,
			},
		});

		const updatedAppointment =
			await prismaAppointmentRepository.findById(appointment.id);

		return { appointment: updatedAppointment ?? appointment };
	},

	async respond(
		appointmentId: string,
		requestId: string,
		currentUser: user,
		data: RespondToRescheduleRequestData,
	): Promise<{ appointment: AppointmentWithRelations }> {
		const appointment = await prismaAppointmentRepository.findById(appointmentId);

		if (!appointment) {
			throw new BadRequestError("Appointment not found");
		}

		if (!isCustomerParticipant(currentUser, appointment)) {
			throw new UnauthorizedError(
				"Only the customer can respond to this reschedule request",
			);
		}

		const rescheduleRequest =
			await prisma.appointment_reschedule_request.findUnique({
				where: { id: requestId },
			});

		if (
			!rescheduleRequest ||
			rescheduleRequest.appointmentId !== appointment.id
		) {
			throw new BadRequestError("Reschedule request not found");
		}

		if (rescheduleRequest.status !== "PENDING") {
			throw new BadRequestError("Reschedule request was already answered");
		}

		if (data.action === "DECLINE") {
			await prisma.appointment_reschedule_request.update({
				where: { id: requestId },
				data: {
					status: "DECLINED",
					respondedAt: new Date(),
				},
			});

			const updatedAppointment =
				await prismaAppointmentRepository.findById(appointment.id);

			return { appointment: updatedAppointment ?? appointment };
		}

		assertCanChangeAppointment(appointment);
		await assertAvailableScheduledAt({
			appointment,
			scheduledAt: rescheduleRequest.proposedScheduledAt,
		});

		const updatedAppointment = await applyReschedule({
			appointment,
			scheduledAt: rescheduleRequest.proposedScheduledAt,
		});

		await prisma.appointment_reschedule_request.update({
			where: { id: requestId },
			data: {
				status: "ACCEPTED",
				respondedAt: new Date(),
			},
		});

		return {
			appointment:
				(await prismaAppointmentRepository.findById(updatedAppointment.id)) ??
				updatedAppointment,
		};
	},
};
