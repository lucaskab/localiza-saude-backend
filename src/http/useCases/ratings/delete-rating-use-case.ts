import { prismaRatingRepository } from "@/http/repositories/ratings/ratings-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const deleteRatingUseCase = {
	async execute(id: string): Promise<{ message: string }> {
		const existingRating = await prismaRatingRepository.findById(id);

		if (!existingRating) {
			throw new BadRequestError("Rating not found");
		}

		await prismaRatingRepository.delete(id);

		return { message: "Rating deleted successfully" };
	},
};
