import type { RatingWithRelations } from "@/http/repositories/ratings/ratings-repository-contract";
import { prismaRatingRepository } from "@/http/repositories/ratings/ratings-repository-implementation";

export const getRatingsByProviderUseCase = {
	async execute(healthcareProviderId: string): Promise<{
		ratings: RatingWithRelations[];
		stats: {
			averageRating: number;
			totalRatings: number;
		};
	}> {
		const ratings =
			await prismaRatingRepository.findByHealthcareProviderId(
				healthcareProviderId,
			);

		const stats =
			await prismaRatingRepository.getProviderStats(healthcareProviderId);

		return {
			ratings,
			stats,
		};
	},
};
