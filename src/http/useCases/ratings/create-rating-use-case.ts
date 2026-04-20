import { prisma } from "@/database/prisma";
import type {
	CreateRatingData,
	RatingWithRelations,
} from "@/http/repositories/ratings/ratings-repository-contract";
import { prismaRatingRepository } from "@/http/repositories/ratings/ratings-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const createRatingUseCase = {
	async execute(
		data: CreateRatingData,
	): Promise<{ rating: RatingWithRelations }> {
		// Validate customer exists
		const customer = await prisma.customer.findUnique({
			where: { id: data.customerId },
		});

		if (!customer) {
			throw new BadRequestError("Customer not found");
		}

		// Validate healthcare provider exists
		const provider = await prisma.healthcare_provider.findUnique({
			where: { id: data.healthcareProviderId },
		});

		if (!provider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		// Check if customer already rated this provider
		const existingRating =
			await prismaRatingRepository.findByCustomerAndProvider(
				data.customerId,
				data.healthcareProviderId,
			);

		if (existingRating) {
			throw new BadRequestError(
				"Customer has already rated this healthcare provider. Use update instead.",
			);
		}

		const rating = await prismaRatingRepository.create(data);

		return { rating };
	},
};
