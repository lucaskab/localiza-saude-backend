import { categoryPresenter } from "@/http/presenters/category-presenter";
import { prismaCategoryRepository } from "@/http/repositories/categories/categories-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { getNextAvailableSlotsByProviderIds } from "@/http/useCases/healthcare-providers/get-next-available-slots";
import { getProviderRatingSummariesByProviderIds } from "@/http/useCases/ratings/get-provider-rating-summaries";

export const getCategoryByIdUseCase = {
	async execute(id: string) {
		const category = await prismaCategoryRepository.findById(id);

		if (!category) {
			throw new BadRequestError("Category not found");
		}
		const providerIds = category.healthcareProviderCategories.map(
			(hpc) => hpc.healthcareProviderId,
		);
		const [nextAvailableByProviderId, ratingSummariesByProviderId] =
			await Promise.all([
				getNextAvailableSlotsByProviderIds(providerIds),
				getProviderRatingSummariesByProviderIds(providerIds),
			]);

		return {
			category: categoryPresenter.toHTTP(
				category,
				nextAvailableByProviderId,
				ratingSummariesByProviderId,
			),
		};
	},
};
