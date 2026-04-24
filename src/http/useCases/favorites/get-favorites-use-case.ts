import { prisma } from "@/database/prisma";
import type { HealthcareProviderWithRelations } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { getNextAvailableSlotsByProviderIds } from "@/http/useCases/healthcare-providers/get-next-available-slots";
import { getProviderRatingSummariesByProviderIds } from "@/http/useCases/ratings/get-provider-rating-summaries";

type FavoriteRow = {
	healthcare_provider_id: string;
};

type FavoriteHealthcareProvider = HealthcareProviderWithRelations & {
	nextAvailableAt: Date | null;
	averageRating: number;
	totalRatings: number;
};

export const getFavoritesUseCase = {
	async execute(customerId: string): Promise<{
		favorites: FavoriteHealthcareProvider[];
	}> {
		const favoriteRows = await prisma.$queryRaw<FavoriteRow[]>`
			SELECT healthcare_provider_id
			FROM customer_favorite_providers
			WHERE customer_id = ${customerId}
			ORDER BY created_at DESC
		`;
		const providerIds = favoriteRows.map((row) => row.healthcare_provider_id);

		if (providerIds.length === 0) {
			return { favorites: [] };
		}

		const providers = (await prisma.healthcare_provider.findMany({
			where: {
				id: {
					in: providerIds,
				},
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						firstName: true,
						lastName: true,
						email: true,
						emailVerified: true,
						phone: true,
						image: true,
						role: true,
						createdAt: true,
						updatedAt: true,
					},
				},
				procedures: {
					orderBy: {
						createdAt: "desc",
					},
				},
			},
		})) as HealthcareProviderWithRelations[];

		const [nextAvailableByProviderId, ratingSummariesByProviderId] =
			await Promise.all([
				getNextAvailableSlotsByProviderIds(providerIds),
				getProviderRatingSummariesByProviderIds(providerIds),
			]);
		const providersById = new Map(
			providers.map((provider) => [provider.id, provider]),
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
