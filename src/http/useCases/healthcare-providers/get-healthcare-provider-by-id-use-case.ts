import type { HealthcareProviderWithRelations } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const getHealthcareProviderByIdUseCase = {
	async execute(
		id: string,
	): Promise<{ healthcareProvider: HealthcareProviderWithRelations }> {
		const healthcareProvider =
			await prismaHealthcareProviderRepository.findById(id);

		if (!healthcareProvider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		return { healthcareProvider };
	},
};
