import { prismaRatingRepository } from "@/http/repositories/ratings/ratings-repository-implementation";

export const getProviderRatingStatsUseCase = {
	async execute(healthcareProviderId: string): Promise<{
		healthcareProviderId: string;
		averageRating: number;
		totalRatings: number;
	}> {
		const stats =
			await prismaRatingRepository.getProviderStats(healthcareProviderId);

		return {
			healthcareProviderId,
			averageRating: stats.averageRating,
			totalRatings: stats.totalRatings,
		};
	},
};
