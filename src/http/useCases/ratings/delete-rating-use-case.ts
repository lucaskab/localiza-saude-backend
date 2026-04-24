import { prismaRatingRepository } from "@/http/repositories/ratings/ratings-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";

export const deleteRatingUseCase = {
	async execute(id: string, customerId?: string): Promise<{ message: string }> {
		const existingRating = await prismaRatingRepository.findById(id);

		if (!existingRating) {
			throw new BadRequestError("Rating not found");
		}
		if (customerId && existingRating.customerId !== customerId) {
			throw new UnauthorizedError("You can only delete your own rating");
		}

		await prismaRatingRepository.delete(id);

		return { message: "Rating deleted successfully" };
	},
};
