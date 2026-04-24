import { categoryPresenter } from "@/http/presenters/category-presenter";
import { prismaCategoryRepository } from "@/http/repositories/categories/categories-repository-implementation";
import { getNextAvailableSlotsByProviderIds } from "@/http/useCases/healthcare-providers/get-next-available-slots";

export const getCategoriesUseCase = {
	async execute() {
		const categories = await prismaCategoryRepository.findAll();
		const providerIds = categories.flatMap((category) =>
			category.healthcareProviderCategories.map(
				(hpc) => hpc.healthcareProviderId,
			),
		);
		const nextAvailableByProviderId =
			await getNextAvailableSlotsByProviderIds(providerIds);

		return {
			categories: categoryPresenter.toHTTPMany(
				categories,
				nextAvailableByProviderId,
			),
		};
	},
};
