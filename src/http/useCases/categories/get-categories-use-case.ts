import { categoryPresenter } from "@/http/presenters/category-presenter";
import { prismaCategoryRepository } from "@/http/repositories/categories/categories-repository-implementation";

export const getCategoriesUseCase = {
	async execute() {
		const categories = await prismaCategoryRepository.findAll();

		return { categories: categoryPresenter.toHTTPMany(categories) };
	},
};
