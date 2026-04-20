import type { HealthcareProviderWithRelations } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";

export const getHealthcareProvidersUseCase = {
	async execute(): Promise<{
		healthcareProviders: HealthcareProviderWithRelations[];
	}> {
		const healthcareProviders =
			await prismaHealthcareProviderRepository.findAll();

		return { healthcareProviders };
	},
};
