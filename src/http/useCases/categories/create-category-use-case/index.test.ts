import { beforeEach, describe, expect, mock, test } from "bun:test";
import type {
	CategoryWithProfessionals,
	CreateCategoryData,
} from "@/http/repositories/categories/categories-repository-contract";
import type { category } from "../../../../../prisma/generated/prisma/client";

const makeCategory = (
	data: CreateCategoryData = { name: "Cardiologia" },
): CategoryWithProfessionals => ({
	id: "category-1",
	name: data.name,
	description: data.description ?? null,
	createdAt: new Date(),
	updatedAt: new Date(),
	healthcareProviderCategories: [],
});

const mockCategoryRepository = {
	findByName: mock((_: string): Promise<category | null> => Promise.resolve(null)),
	create: mock((data: CreateCategoryData): Promise<CategoryWithProfessionals> =>
		Promise.resolve(makeCategory(data)),
	),
};

mock.module(
	"@/http/repositories/categories/categories-repository-implementation",
	() => ({
		prismaCategoryRepository: mockCategoryRepository,
	}),
);

const { createCategoryUseCase } = await import("./index");

describe("createCategoryUseCase", () => {
	beforeEach(() => {
		mockCategoryRepository.findByName.mockReset();
		mockCategoryRepository.create.mockReset();
		mockCategoryRepository.findByName.mockResolvedValue(null);
		mockCategoryRepository.create.mockImplementation(
			(data: CreateCategoryData): Promise<CategoryWithProfessionals> =>
				Promise.resolve(makeCategory(data)),
		);
	});

	test("creates category when name is available", async () => {
		const result = await createCategoryUseCase.execute({
			name: "Cardiologia",
		});

		expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(
			"Cardiologia",
		);
		expect(mockCategoryRepository.create).toHaveBeenCalledWith({
			name: "Cardiologia",
		});
		expect(result.category.name).toBe("Cardiologia");
	});

	test("rejects duplicate category names", async () => {
		mockCategoryRepository.findByName.mockResolvedValue({
			id: "category-existing",
			name: "Cardiologia",
			description: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await expect(
			createCategoryUseCase.execute({
				name: "Cardiologia",
			}),
		).rejects.toThrow("A category with this name already exists");
	});
});
