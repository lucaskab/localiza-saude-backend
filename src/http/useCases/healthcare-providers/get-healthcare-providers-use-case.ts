import type { HealthcareProviderWithRelations } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { getNextAvailableSlotsByProviderIds } from "./get-next-available-slots";

type HealthcareProviderWithNextAvailability = HealthcareProviderWithRelations & {
	nextAvailableAt: Date | null;
};

export const getHealthcareProvidersUseCase = {
	async execute(): Promise<{
		healthcareProviders: HealthcareProviderWithNextAvailability[];
	}> {
		const healthcareProviders =
			await prismaHealthcareProviderRepository.findAll();
		const nextAvailableByProviderId =
			await getNextAvailableSlotsByProviderIds(
				healthcareProviders.map((provider) => provider.id),
			);

		return {
			healthcareProviders: healthcareProviders.map((provider) => ({
				...provider,
				nextAvailableAt: nextAvailableByProviderId.get(provider.id) ?? null,
			})),
		};
	},
};
