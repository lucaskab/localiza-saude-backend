import type {
	RatingWithRelations,
	UpdateRatingData,
} from "@/http/repositories/ratings/ratings-repository-contract";
import { prismaRatingRepository } from "@/http/repositories/ratings/ratings-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const updateRatingUseCase = {
	async execute(
		id: string,
		data: UpdateRatingData,
	): Promise<{ rating: RatingWithRelations }> {
		const existingRating = await prismaRatingRepository.findById(id);

		if (!existingRating) {
			throw new BadRequestError("Rating not found");
		}

		const rating = await prismaRatingRepository.update(id, data);

		return { rating };
	},
};
