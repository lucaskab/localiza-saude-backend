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
		const customer = await prisma.user.findUnique({
			where: { id: data.customerId, role: "CUSTOMER" },
		});

		if (!customer) {
			throw new BadRequestError("Reviewer user not found");
		}

		const healthcareProvider = await prisma.user.findUnique({
			where: { id: data.healthcareProviderId, role: "HEALTHCARE_PROVIDER" },
		});

		if (!healthcareProvider) {
			throw new BadRequestError("HealthcareProvider user not found");
		}

		const existingRating =
			await prismaRatingRepository.findByCustomerAndHealthcareProvider(
				data.customerId,
				data.healthcareProviderId,
			);

		if (existingRating) {
			throw new BadRequestError(
				"Reviewer has already rated this healthcareProvider. Use update instead.",
			);
		}

		const rating = await prismaRatingRepository.create(data);

		return { rating };
	},
};
