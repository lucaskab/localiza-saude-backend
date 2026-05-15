import type {
	patient_profile,
	user,
} from "../../../../../prisma/generated/prisma/client";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { prismaPatientProfileRepository } from "@/http/repositories/patient-profiles/patient-profiles-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import type { CreateAppointmentBodySchema } from "@/schemas/routes/appointments/create-appointment";

export type ResolvedPatient = {
	customerId: string | null;
	patientProfileId: string | null;
};

export async function assertExistingPatientProfileAccess({
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

export async function resolvePatient({
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
