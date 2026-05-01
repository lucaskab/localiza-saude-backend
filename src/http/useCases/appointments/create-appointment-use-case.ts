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
import { sendAppointmentEventNotificationUseCase } from "@/http/useCases/notifications/send-appointment-event-notification-use-case";
import type { CreateAppointmentBodySchema } from "@/schemas/routes/appointments/create-appointment";
import type {
	customer,
	healthcare_provider,
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
	customer: customer | null;
	healthcareProvider: healthcare_provider | null;
}) {
	if (customer) {
		if (patientProfile.customerOwnerId !== customer.id) {
			throw new UnauthorizedError("You cannot use this patient profile");
		}

		return;
	}

	if (!healthcareProvider) {
		throw new UnauthorizedError("You cannot use this patient profile");
	}

	if (
		patientProfile.createdByHealthcareProviderId === healthcareProvider.id
	) {
		return;
	}

	const hasPreviousAppointment =
		await prismaAppointmentRepository.existsByPatientProfileAndProvider(
			patientProfile.id,
			healthcareProvider.id,
		);

	if (!hasPreviousAppointment) {
		throw new UnauthorizedError("You cannot use this patient profile");
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
	customer: customer | null;
	healthcareProvider: healthcare_provider | null;
}): Promise<ResolvedPatient> {
	const patient = data.patient ?? { type: "SELF" as const };
	const isProviderActor = currentUser.role === "HEALTHCARE_PROVIDER";

	if (patient.type === "SELF") {
		if (isProviderActor || !customer) {
			throw new BadRequestError(
				"Select or create a patient profile for this appointment",
			);
		}

		return {
			customerId: customer.id,
			patientProfileId: null,
		};
	}

	if (patient.type === "EXISTING_PROFILE") {
		const patientProfile = await prismaPatientProfileRepository.findById(
			patient.patientProfileId,
		);

		if (!patientProfile) {
			throw new BadRequestError("Patient profile not found");
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
		...patient.profile,
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

		if (isProviderActor && !actingHealthcareProvider) {
			throw new BadRequestError(
				"User is not registered as a healthcare provider",
			);
		}

		if (!isProviderActor && !customer) {
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
			await prismaAppointmentRepository.findByProviderAndDateRange(
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

		const patient = await resolvePatient({
			currentUser,
			data,
			customer,
			healthcareProvider: actingHealthcareProvider,
		});

		const appointmentData: CreateAppointmentData = {
			customerId: patient.customerId,
			patientProfileId: patient.patientProfileId,
			healthcareProviderId: healthcareProvider.id,
			scheduledAt: data.scheduledAt,
			procedureIds: data.procedureIds,
			notes: data.notes,
			status: isProviderActor ? "CONFIRMED" : "SCHEDULED",
		};

		const appointment = await prismaAppointmentRepository.create(
			appointmentData,
		);

		if (isProviderActor) {
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
