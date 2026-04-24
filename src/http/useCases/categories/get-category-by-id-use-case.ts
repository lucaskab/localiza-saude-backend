import { categoryPresenter } from "@/http/presenters/category-presenter";
import { prismaCategoryRepository } from "@/http/repositories/categories/categories-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { getNextAvailableSlotsByProviderIds } from "@/http/useCases/healthcare-providers/get-next-available-slots";

export const getCategoryByIdUseCase = {
	async execute(id: string) {
		const category = await prismaCategoryRepository.findById(id);

		if (!category) {
			throw new BadRequestError("Category not found");
		}
		const nextAvailableByProviderId =
			await getNextAvailableSlotsByProviderIds(
				category.healthcareProviderCategories.map(
					(hpc) => hpc.healthcareProviderId,
				),
			);

		return {
			category: categoryPresenter.toHTTP(category, nextAvailableByProviderId),
		};
	},
};
