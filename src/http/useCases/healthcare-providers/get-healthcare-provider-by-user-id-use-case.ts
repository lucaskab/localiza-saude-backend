import type { HealthcareProviderWithRelations } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const getHealthcareProviderByUserIdUseCase = {
	async execute(
		userId: string,
	): Promise<{ healthcareProvider: HealthcareProviderWithRelations }> {
		const healthcareProvider =
			await prismaHealthcareProviderRepository.findByUserId(userId);

		if (!healthcareProvider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		return { healthcareProvider };
	},
};
