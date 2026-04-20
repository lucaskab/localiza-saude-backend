import { categoryPresenter } from "@/http/presenters/category-presenter";
import { prismaCategoryRepository } from "@/http/repositories/categories/categories-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const getCategoryByIdUseCase = {
	async execute(id: string) {
		const category = await prismaCategoryRepository.findById(id);

		if (!category) {
			throw new BadRequestError("Category not found");
		}

		return { category: categoryPresenter.toHTTP(category) };
	},
};
