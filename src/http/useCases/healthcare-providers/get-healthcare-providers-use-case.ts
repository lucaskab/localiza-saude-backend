import type { HealthcareProviderWithRelations } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { getProviderRatingSummariesByProviderIds } from "@/http/useCases/ratings/get-provider-rating-summaries";
import { getNextAvailableSlotsByProviderIds } from "./get-next-available-slots";

type HealthcareProviderWithNextAvailability = HealthcareProviderWithRelations & {
	nextAvailableAt: Date | null;
	averageRating: number;
	totalRatings: number;
};

export const getHealthcareProvidersUseCase = {
	async execute(): Promise<{
		healthcareProviders: HealthcareProviderWithNextAvailability[];
	}> {
		const healthcareProviders =
			await prismaHealthcareProviderRepository.findAll();
		const providerIds = healthcareProviders.map((provider) => provider.id);
		const [nextAvailableByProviderId, ratingSummariesByProviderId] =
			await Promise.all([
				getNextAvailableSlotsByProviderIds(providerIds),
				getProviderRatingSummariesByProviderIds(providerIds),
			]);

		return {
			healthcareProviders: healthcareProviders.map((provider) => {
				const ratingSummary = ratingSummariesByProviderId.get(provider.id);

				return {
					...provider,
					nextAvailableAt: nextAvailableByProviderId.get(provider.id) ?? null,
					averageRating: ratingSummary?.averageRating ?? 0,
					totalRatings: ratingSummary?.totalRatings ?? 0,
				};
			}),
		};
	},
};
