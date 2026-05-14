import type {
	AppointmentWithRelations,
	UpdateAppointmentData,
} from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import { googleMeetService } from "@/http/services/google-meet-service";
import { notifyWaitlistSlotAvailableUseCase } from "@/http/useCases/appointment-waitlist/notify-waitlist-slot-available-use-case";
import { sendAppointmentEventNotificationUseCase } from "@/http/useCases/notifications/send-appointment-event-notification-use-case";
import type { user } from "../../../../../prisma/generated/prisma/client";

async function assertCanUpdateAppointment(
	currentUser: user,
	appointment: AppointmentWithRelations,
) {
	if (
		appointment.customerId === currentUser.id ||
		appointment.patientProfile?.customerOwnerId === currentUser.id ||
		appointment.healthcareProviderId === currentUser.id ||
		currentUser.role === "ADMIN"
	) {
		return;
	}

	if (currentUser.role === "STAFF" || currentUser.role === "HEALTHCARE_PROVIDER") {
		await clinicRbac.assertCanManageProvider(
			currentUser,
			appointment.healthcareProviderId,
			"MANAGE_APPOINTMENTS",
		);
		return;
	}

	throw new UnauthorizedError("You cannot update this appointment");
}

function calculateCancellationFee(appointment: AppointmentWithRelations) {
	const provider = appointment.healthcareProvider;

	if (!provider.cancellationPolicyEnabled) {
		return {
			applies: false,
			feeInCents: null,
		};
	}

	if (
		provider.cancellationPolicyHoursBefore === null ||
		provider.cancellationPolicyHoursBefore === undefined
	) {
		return {
			applies: false,
			feeInCents: null,
		};
	}

	const millisecondsUntilAppointment =
		appointment.scheduledAt.getTime() - Date.now();
	const hoursUntilAppointment =
		millisecondsUntilAppointment / (1000 * 60 * 60);
	const applies = hoursUntilAppointment < provider.cancellationPolicyHoursBefore;

	if (!applies) {
		return {
			applies: false,
			feeInCents: null,
		};
	}

	if (provider.cancellationPolicyPenaltyType === "FIXED") {
		return {
			applies: true,
			feeInCents: provider.cancellationPolicyFixedFeeCents ?? 0,
		};
	}

	if (provider.cancellationPolicyPenaltyType === "PERCENTAGE") {
		const percentage = provider.cancellationPolicyPercentage ?? 0;

		return {
			applies: true,
			feeInCents: Math.round(
				appointment.totalPriceCents * (percentage / 100),
			),
		};
	}

	return {
		applies: true,
		feeInCents: 0,
	};
}

export const updateAppointmentUseCase = {
	async execute(
		currentUser: user,
		id: string,
		data: UpdateAppointmentData,
	): Promise<{ appointment: AppointmentWithRelations }> {
		const previousAppointment = await prismaAppointmentRepository.findById(id);

		if (!previousAppointment) {
			throw new BadRequestError("Appointment not found");
		}

		await assertCanUpdateAppointment(currentUser, previousAppointment);

		const updateData: UpdateAppointmentData = { ...data };

		if (
			data.status === "CANCELLED" &&
			previousAppointment.status !== "CANCELLED"
		) {
			const policy = calculateCancellationFee(previousAppointment);
			const cancellationReason = data.cancellationReason?.trim() || null;

			if (
				policy.applies &&
				previousAppointment.healthcareProvider
					.cancellationPolicyRequiresJustification &&
				!cancellationReason
			) {
				throw new BadRequestError(
					"Cancellation justification is required for this provider policy",
				);
			}

			updateData.cancellationReason = cancellationReason;
			updateData.cancellationFeeCents = policy.feeInCents;
			updateData.cancellationPolicyAppliedAt = policy.applies ? new Date() : null;
			updateData.cancelledAt = new Date();
			updateData.cancelledByUserId = currentUser.id;
		}

		let appointment = await prismaAppointmentRepository.update(id, updateData);

		if (
			data.status &&
			previousAppointment &&
			previousAppointment.status !== appointment.status
		) {
			if (appointment.status === "CONFIRMED") {
				appointment = await googleMeetService
					.ensureOnlineMeeting(appointment)
					.catch((error) => {
						console.error("Failed to create Google Meet link:", error);
						return appointment;
					});
			}

			await sendAppointmentEventNotificationUseCase
				.sendAppointmentStatusUpdateToCustomer(appointment)
				.catch((error) => {
					console.error("Failed to send appointment status notification:", error);
				});

			if (appointment.status === "CANCELLED") {
				await notifyWaitlistSlotAvailableUseCase.execute(appointment).catch((error) => {
					console.error("Failed to notify waitlist slot availability:", error);
				});
			}
		}

		return { appointment };
	},
};
