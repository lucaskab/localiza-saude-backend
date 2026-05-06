import type { HealthcareProviderWithRelations } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { getProviderRatingSummariesByProviderIds } from "@/http/useCases/ratings/get-provider-rating-summaries";
import { getNextAvailableSlotsByProviderIds } from "./get-next-available-slots";

type HealthcareProviderWithNextAvailability = HealthcareProviderWithRelations & {
	nextAvailableAt: Date | null;
	startingPriceCents: number | null;
	averageRating: number;
	totalRatings: number;
};

function getStartingPriceCents(provider: HealthcareProviderWithRelations) {
	if (provider.procedures.length === 0) {
		return null;
	}

	return Math.min(
		...provider.procedures.map((procedure) => procedure.priceInCents),
	);
}

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
					startingPriceCents: getStartingPriceCents(provider),
					averageRating: ratingSummary?.averageRating ?? 0,
					totalRatings: ratingSummary?.totalRatings ?? 0,
				};
			}),
		};
	},
};
