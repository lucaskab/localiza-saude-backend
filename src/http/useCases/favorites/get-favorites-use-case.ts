import type { HealthcareProviderWithRelations } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaFavoriteRepository } from "@/http/repositories/favorites/favorites-repository-implementation";
import { getNextAvailableSlotsByProviderIds } from "@/http/useCases/healthcare-providers/get-next-available-slots";
import { getProviderRatingSummariesByProviderIds } from "@/http/useCases/ratings/get-provider-rating-summaries";

type FavoriteHealthcareProvider = HealthcareProviderWithRelations & {
	nextAvailableAt: Date | null;
	averageRating: number;
	totalRatings: number;
};

export const getFavoritesUseCase = {
	async execute(customerId: string): Promise<{
		favorites: FavoriteHealthcareProvider[];
	}> {
		const favorites = await prismaFavoriteRepository.findByCustomerId(customerId);
		const providerIds = favorites.map((favorite) => favorite.healthcareProviderId);

		if (providerIds.length === 0) {
			return { favorites: [] };
		}

		const [nextAvailableByProviderId, ratingSummariesByProviderId] =
			await Promise.all([
				getNextAvailableSlotsByProviderIds(providerIds),
				getProviderRatingSummariesByProviderIds(providerIds),
			]);
		const providersById = new Map(
			favorites.map((favorite) => [
				favorite.healthcareProvider.id,
				favorite.healthcareProvider,
			]),
		);

		return {
			favorites: providerIds.flatMap((providerId) => {
				const provider = providersById.get(providerId);

				if (!provider) {
					return [];
				}

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
