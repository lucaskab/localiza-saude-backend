import type {
	AppointmentWithRelations,
	CreateAppointmentData,
} from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { prismaPatientProfileRepository } from "@/http/repositories/patient-profiles/patient-profiles-repository-implementation";
import { prismaProcedureRepository } from "@/http/repositories/procedures/procedures-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import { googleMeetService } from "@/http/services/google-meet-service";
import { sendAppointmentEventNotificationUseCase } from "@/http/useCases/notifications/send-appointment-event-notification-use-case";
import type { CreateAppointmentBodySchema } from "@/schemas/routes/appointments/create-appointment";
import { isServiceModality } from "@/schemas/service-modalities";
import type {
	patient_profile,
	user,
} from "../../../../prisma/generated/prisma/client";

function hasDateOverlap(
	startA: Date,
	endA: Date,
	startB: Date,
	endB: Date,
): boolean {
	return startA < endB && endA > startB;
}

type ResolvedPatient = {
	customerId: string | null;
	patientProfileId: string | null;
};

async function assertExistingPatientProfileAccess({
	patientProfile,
	customer,
	healthcareProvider,
}: {
	patientProfile: patient_profile;
	customer: user | null;
	healthcareProvider: user | null;
}) {
	if (customer) {
		if (patientProfile.customerOwnerId !== customer.id) {
			throw new UnauthorizedError("You cannot use this customer profile");
		}

		return;
	}

	if (!healthcareProvider) {
		throw new UnauthorizedError("You cannot use this customer profile");
	}

	if (
		patientProfile.createdByHealthcareProviderId === healthcareProvider.id
	) {
		return;
	}

	const hasPreviousAppointment =
		await prismaAppointmentRepository.existsByPatientProfileAndHealthcareProvider(
			patientProfile.id,
			healthcareProvider.id,
		);

	if (!hasPreviousAppointment) {
		throw new UnauthorizedError("You cannot use this customer profile");
	}
}

async function resolvePatient({
	currentUser,
	data,
	customer,
	healthcareProvider,
}: {
	currentUser: user;
	data: CreateAppointmentBodySchema;
	customer: user | null;
	healthcareProvider: user | null;
}): Promise<ResolvedPatient> {
	const requestedCustomer = data.customer ?? { type: "SELF" as const };
	const isProviderActor =
		currentUser.role === "HEALTHCARE_PROVIDER" || currentUser.role === "STAFF";

	if (requestedCustomer.type === "SELF") {
		if (isProviderActor || !customer) {
			throw new BadRequestError(
				"Select or create a customer profile for this appointment",
			);
		}

		return {
			customerId: customer.id,
			patientProfileId: null,
		};
	}

	if (requestedCustomer.type === "EXISTING_PROFILE") {
		const patientProfile = await prismaPatientProfileRepository.findById(
			requestedCustomer.patientProfileId,
		);

		if (!patientProfile) {
			throw new BadRequestError("Customer profile not found");
		}

		await assertExistingPatientProfileAccess({
			patientProfile,
			customer: isProviderActor ? null : customer,
			healthcareProvider: isProviderActor ? healthcareProvider : null,
		});

		return {
			customerId: isProviderActor
				? patientProfile.customerOwnerId
				: customer?.id ?? null,
			patientProfileId: patientProfile.id,
		};
	}

	const patientProfile = await prismaPatientProfileRepository.create({
		...requestedCustomer.profile,
		customerOwnerId: isProviderActor ? null : customer?.id ?? null,
		createdByHealthcareProviderId: isProviderActor
			? healthcareProvider?.id
			: null,
	});

	return {
		customerId: isProviderActor ? null : customer?.id ?? null,
		patientProfileId: patientProfile.id,
	};
}

export const createAppointmentUseCase = {
	async execute(
		currentUser: user,
		data: CreateAppointmentBodySchema,
	): Promise<{ appointment: AppointmentWithRelations }> {
		const [customer, actingHealthcareProvider] = await Promise.all([
			prismaCustomerRepository.findByUserId(currentUser.id),
			prismaHealthcareProviderRepository.findByUserId(currentUser.id),
		]);

		const isProviderActor = currentUser.role === "HEALTHCARE_PROVIDER";
		const isStaffActor = currentUser.role === "STAFF";
		const isClinicActor = isProviderActor || isStaffActor;

		if (isProviderActor && !actingHealthcareProvider) {
			throw new BadRequestError(
				"User is not registered as a healthcare provider",
			);
		}

		if (!isClinicActor && !customer) {
			throw new BadRequestError("User is not registered as a customer");
		}

		if (
			isProviderActor &&
			data.healthcareProviderId &&
			data.healthcareProviderId !== actingHealthcareProvider?.id
		) {
			throw new UnauthorizedError(
				"Providers can only create appointments for their own schedule",
			);
		}

		const healthcareProviderId = isProviderActor
			? actingHealthcareProvider?.id
			: data.healthcareProviderId;

		if (!healthcareProviderId) {
			throw new BadRequestError("Healthcare provider is required");
		}

		const healthcareProvider =
			await prismaHealthcareProviderRepository.findById(healthcareProviderId);

		if (!healthcareProvider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		if (isStaffActor) {
			await clinicRbac.assertCanCreateAppointmentForProvider(
				currentUser,
				healthcareProvider.id,
			);
		}

		const availableServiceModalities =
			healthcareProvider.serviceModalities.filter(isServiceModality);
		const serviceModality =
			data.serviceModality ??
			(isClinicActor ? availableServiceModalities[0] : undefined);

		if (!serviceModality) {
			throw new BadRequestError(
				"Healthcare provider has not configured appointment modalities",
			);
		}

		if (!availableServiceModalities.includes(serviceModality)) {
			throw new BadRequestError(
				"Selected appointment modality is not offered by this provider",
			);
		}

		const providerProcedures =
			await prismaProcedureRepository.findByHealthcareProviderId(
				healthcareProvider.id,
			);
		const uniqueProcedureIds = new Set(data.procedureIds);
		const procedures = providerProcedures.filter((procedure) =>
			uniqueProcedureIds.has(procedure.id),
		);

		if (
			procedures.length !== uniqueProcedureIds.size ||
			uniqueProcedureIds.size !== data.procedureIds.length
		) {
			throw new BadRequestError(
				"One or more procedures not found or do not belong to this provider",
			);
		}

		const totalDurationMinutes = procedures.reduce(
			(total, procedure) => total + procedure.durationInMinutes,
			0,
		);

		const appointmentStart = new Date(data.scheduledAt);
		const appointmentEnd = new Date(
			appointmentStart.getTime() + totalDurationMinutes * 60 * 1000,
		);

		const startOfDay = new Date(appointmentStart);
		startOfDay.setUTCHours(0, 0, 0, 0);
		const endOfDay = new Date(appointmentStart);
		endOfDay.setUTCHours(23, 59, 59, 999);

		const existingAppointments =
			await prismaAppointmentRepository.findByProfessionalAndDateRange(
				healthcareProvider.id,
				{
					startDate: startOfDay,
					endDate: endOfDay,
				},
			);

		const hasConflict = existingAppointments.some((appointment) => {
			const existingStart = new Date(appointment.scheduledAt);
			const existingEnd = new Date(
				existingStart.getTime() +
					appointment.totalDurationMinutes * 60 * 1000,
			);

			return hasDateOverlap(
				appointmentStart,
				appointmentEnd,
				existingStart,
				existingEnd,
			);
		});

		if (hasConflict) {
			throw new BadRequestError(
				"This time slot is no longer available for this provider",
			);
		}

		const resolvedPatient = await resolvePatient({
			currentUser,
			data,
			customer,
			healthcareProvider: isClinicActor
				? healthcareProvider
				: actingHealthcareProvider,
		});

		const appointmentData: CreateAppointmentData = {
			customerId: resolvedPatient.customerId,
			patientProfileId: resolvedPatient.patientProfileId,
			healthcareProviderId: healthcareProvider.id,
			scheduledAt: data.scheduledAt,
			procedureIds: data.procedureIds,
			serviceModality,
			notes: data.notes,
			status: isClinicActor ? "CONFIRMED" : "SCHEDULED",
		};

		let appointment = await prismaAppointmentRepository.create(
			appointmentData,
		);

		if (appointment.status === "CONFIRMED") {
			appointment = await googleMeetService
				.ensureOnlineMeeting(appointment)
				.catch((error) => {
					console.error("Failed to create Google Meet link:", error);
					return appointment;
				});
		}

		if (isClinicActor) {
			await sendAppointmentEventNotificationUseCase
				.sendAppointmentStatusUpdateToCustomer(appointment)
				.catch((error) => {
					console.error("Failed to send appointment notification:", error);
				});
		} else {
			await sendAppointmentEventNotificationUseCase
				.sendNewAppointmentRequestToProvider(appointment)
				.catch((error) => {
					console.error("Failed to send appointment notification:", error);
				});
		}

		return { appointment };
	},
};
