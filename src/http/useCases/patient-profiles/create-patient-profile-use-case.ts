import { prismaPatientProfileRepository } from "@/http/repositories/patient-profiles/patient-profiles-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { CreatePatientProfileBodySchema } from "@/schemas/routes/patient-profiles/create-patient-profile";
import type { patient_profile, user } from "../../../../prisma/generated/prisma/client";
import { getPatientProfileActor } from "./patient-profile-access";

export const createPatientProfileUseCase = {
	async execute(
		currentUser: user,
		data: CreatePatientProfileBodySchema,
	): Promise<{ patientProfile: patient_profile }> {
		const { customer, healthcareProvider } =
			await getPatientProfileActor(currentUser);
		const isProviderActor = currentUser.role === "HEALTHCARE_PROVIDER";

		if (!customer && !healthcareProvider) {
			throw new BadRequestError("User is not registered as a customer or provider");
		}

		if (isProviderActor && !healthcareProvider) {
			throw new BadRequestError("User is not registered as a healthcare provider");
		}

		if (!isProviderActor && !customer) {
			throw new BadRequestError("User is not registered as a customer");
		}

		const patientProfile = await prismaPatientProfileRepository.create({
			...data,
			customerOwnerId: isProviderActor ? null : customer?.id ?? null,
			createdByHealthcareProviderId: isProviderActor
				? healthcareProvider?.id
				: null,
		});

		return { patientProfile };
	},
};
