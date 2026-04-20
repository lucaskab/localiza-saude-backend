import { prismaCategoryRepository } from "@/http/repositories/categories/categories-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const deleteCategoryUseCase = {
	async execute(id: string): Promise<{ message: string }> {
		const existingCategory = await prismaCategoryRepository.findById(id);

		if (!existingCategory) {
			throw new BadRequestError("Category not found");
		}

		await prismaCategoryRepository.delete(id);

		return { message: "Category deleted successfully" };
	},
};
