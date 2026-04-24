import type { HealthcareProviderWithRelations } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { getProviderRatingSummariesByProviderIds } from "@/http/useCases/ratings/get-provider-rating-summaries";

type HealthcareProviderWithRatingSummary = HealthcareProviderWithRelations & {
	averageRating: number;
	totalRatings: number;
};

export const getHealthcareProviderByIdUseCase = {
	async execute(
		id: string,
	): Promise<{ healthcareProvider: HealthcareProviderWithRatingSummary }> {
		const healthcareProvider =
			await prismaHealthcareProviderRepository.findById(id);

		if (!healthcareProvider) {
			throw new BadRequestError("Healthcare provider not found");
		}
		const ratingSummaries = await getProviderRatingSummariesByProviderIds([
			healthcareProvider.id,
		]);
		const ratingSummary = ratingSummaries.get(healthcareProvider.id);

		return {
			healthcareProvider: {
				...healthcareProvider,
				averageRating: ratingSummary?.averageRating ?? 0,
				totalRatings: ratingSummary?.totalRatings ?? 0,
			},
		};
	},
};
