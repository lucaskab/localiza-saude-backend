import { categoryPresenter } from "@/http/presenters/category-presenter";
import { prismaCategoryRepository } from "@/http/repositories/categories/categories-repository-implementation";
import { getNextAvailableSlotsByProviderIds } from "@/http/useCases/healthcare-providers/get-next-available-slots";
import { getProviderRatingSummariesByProviderIds } from "@/http/useCases/ratings/get-provider-rating-summaries";

export const getCategoriesUseCase = {
	async execute() {
		const categories = await prismaCategoryRepository.findAll();
		const providerIds = categories.flatMap((category) =>
			category.healthcareProviderCategories.map(
				(hpc) => hpc.healthcareProviderId,
			),
		);
		const [nextAvailableByProviderId, ratingSummariesByProviderId] =
			await Promise.all([
				getNextAvailableSlotsByProviderIds(providerIds),
				getProviderRatingSummariesByProviderIds(providerIds),
			]);

		return {
			categories: categoryPresenter.toHTTPMany(
				categories,
				nextAvailableByProviderId,
				ratingSummariesByProviderId,
			),
		};
	},
};
