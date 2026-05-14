import { beforeEach, describe, expect, mock, test } from "bun:test";
import type {
	CategoryWithProfessionals,
	UpdateCategoryData,
} from "@/http/repositories/categories/categories-repository-contract";
import type { category } from "../../../../../prisma/generated/prisma/client";

const makeCategory = (
	data: UpdateCategoryData = { name: "Cardiologia" },
): CategoryWithProfessionals => ({
	id: "category-1",
	name: data.name ?? "Cardiologia",
	description: data.description ?? null,
	createdAt: new Date(),
	updatedAt: new Date(),
	healthcareProviderCategories: [],
});

const mockCategoryRepository = {
	findById: mock(
		(_: string): Promise<CategoryWithProfessionals | null> =>
			Promise.resolve(makeCategory()),
	),
	findByName: mock((_: string): Promise<category | null> => Promise.resolve(null)),
	update: mock(
		(id: string, data: UpdateCategoryData): Promise<CategoryWithProfessionals> =>
			Promise.resolve({
				...makeCategory(data),
				id,
			}),
	),
};

mock.module(
	"@/http/repositories/categories/categories-repository-implementation",
	() => ({
		prismaCategoryRepository: mockCategoryRepository,
	}),
);

const { updateCategoryUseCase } = await import("./index");

describe("updateCategoryUseCase", () => {
	beforeEach(() => {
		mockCategoryRepository.findById.mockReset();
		mockCategoryRepository.findByName.mockReset();
		mockCategoryRepository.update.mockReset();
		mockCategoryRepository.findById.mockResolvedValue(makeCategory());
		mockCategoryRepository.findByName.mockResolvedValue(null);
		mockCategoryRepository.update.mockImplementation(
			(id: string, data: UpdateCategoryData): Promise<CategoryWithProfessionals> =>
				Promise.resolve({
					...makeCategory(data),
					id,
				}),
		);
	});

	test("updates category when target exists", async () => {
		const result = await updateCategoryUseCase.execute("category-1", {
			name: "Dermatologia",
		});

		expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(
			"Dermatologia",
		);
		expect(mockCategoryRepository.update).toHaveBeenCalledWith("category-1", {
			name: "Dermatologia",
		});
		expect(result.category.name).toBe("Dermatologia");
	});

	test("rejects updates to an existing category name", async () => {
		mockCategoryRepository.findByName.mockResolvedValue({
			id: "category-2",
			name: "Dermatologia",
			description: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await expect(
			updateCategoryUseCase.execute("category-1", {
				name: "Dermatologia",
			}),
		).rejects.toThrow("A category with this name already exists");
	});
});
