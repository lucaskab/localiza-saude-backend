import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { CategoryWithProfessionals } from "@/http/repositories/categories/categories-repository-contract";

const makeCategory = (): CategoryWithProfessionals => ({
	id: "category-1",
	name: "Cardiologia",
	description: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	healthcareProviderCategories: [],
});

const mockCategoryRepository = {
	findById: mock(
		(_: string): Promise<CategoryWithProfessionals | null> =>
			Promise.resolve(makeCategory()),
	),
	delete: mock((_: string): Promise<void> => Promise.resolve()),
};

mock.module(
	"@/http/repositories/categories/categories-repository-implementation",
	() => ({
		prismaCategoryRepository: mockCategoryRepository,
	}),
);

const { deleteCategoryUseCase } = await import("./index");

describe("deleteCategoryUseCase", () => {
	beforeEach(() => {
		mockCategoryRepository.findById.mockReset();
		mockCategoryRepository.delete.mockReset();
		mockCategoryRepository.findById.mockResolvedValue(makeCategory());
		mockCategoryRepository.delete.mockResolvedValue(undefined);
	});

	test("deletes category when it exists", async () => {
		const result = await deleteCategoryUseCase.execute("category-1");

		expect(mockCategoryRepository.delete).toHaveBeenCalledWith("category-1");
		expect(result.message).toBe("Category deleted successfully");
	});

	test("throws when category does not exist", async () => {
		mockCategoryRepository.findById.mockResolvedValue(null);

		await expect(deleteCategoryUseCase.execute("missing")).rejects.toThrow(
			"Category not found",
		);
	});
});
