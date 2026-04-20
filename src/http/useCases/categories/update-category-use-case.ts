import { categoryPresenter } from "@/http/presenters/category-presenter";
import type { UpdateCategoryData } from "@/http/repositories/categories/categories-repository-contract";
import { prismaCategoryRepository } from "@/http/repositories/categories/categories-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const updateCategoryUseCase = {
	async execute(id: string, data: UpdateCategoryData) {
		const existingCategory = await prismaCategoryRepository.findById(id);

		if (!existingCategory) {
			throw new BadRequestError("Category not found");
		}

		// Check if name is being updated and if it already exists
		if (data.name && data.name !== existingCategory.name) {
			const categoryWithSameName = await prismaCategoryRepository.findByName(
				data.name,
			);

			if (categoryWithSameName) {
				throw new BadRequestError("A category with this name already exists");
			}
		}

		const category = await prismaCategoryRepository.update(id, data);

		return { category: categoryPresenter.toHTTP(category) };
	},
};
