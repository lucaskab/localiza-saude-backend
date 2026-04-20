import { categoryPresenter } from "@/http/presenters/category-presenter";
import type { CreateCategoryData } from "@/http/repositories/categories/categories-repository-contract";
import { prismaCategoryRepository } from "@/http/repositories/categories/categories-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const createCategoryUseCase = {
	async execute(data: CreateCategoryData) {
		// Check if category with this name already exists
		const existingCategory = await prismaCategoryRepository.findByName(
			data.name,
		);

		if (existingCategory) {
			throw new BadRequestError("A category with this name already exists");
		}

		const category = await prismaCategoryRepository.create(data);

		return { category: categoryPresenter.toHTTP(category) };
	},
};
