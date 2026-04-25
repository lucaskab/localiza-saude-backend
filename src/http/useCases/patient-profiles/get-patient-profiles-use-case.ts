import { prismaPatientProfileRepository } from "@/http/repositories/patient-profiles/patient-profiles-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { patient_profile, user } from "../../../../prisma/generated/prisma/client";
import { getPatientProfileActor } from "./patient-profile-access";

export const getPatientProfilesUseCase = {
	async execute(
		currentUser: user,
	): Promise<{ patientProfiles: patient_profile[] }> {
		const { customer, healthcareProvider } =
			await getPatientProfileActor(currentUser);

		if (currentUser.role === "HEALTHCARE_PROVIDER") {
			if (!healthcareProvider) {
				throw new BadRequestError(
					"User is not registered as a healthcare provider",
				);
			}

			const patientProfiles =
				await prismaPatientProfileRepository.findByHealthcareProviderId(
					healthcareProvider.id,
				);

			return { patientProfiles };
		}

		if (!customer) {
			throw new BadRequestError("User is not registered as a customer");
		}

		const patientProfiles =
			await prismaPatientProfileRepository.findByCustomerOwnerId(customer.id);

		return { patientProfiles };
	},
};
