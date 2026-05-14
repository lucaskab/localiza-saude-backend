import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { CategoryWithProfessionals } from "@/http/repositories/categories/categories-repository-contract";
import { makeUser } from "@/http/tests/factories";

const makeCategory = (): CategoryWithProfessionals => ({
	id: "category-1",
	name: "Cardiologia",
	description: null,
	createdAt: new Date("2026-08-01T10:00:00.000Z"),
	updatedAt: new Date("2026-08-01T10:00:00.000Z"),
	healthcareProviderCategories: [
		{
			id: "hpc-1",
			healthcareProviderId: "provider-1",
			categoryId: "category-1",
			createdAt: new Date("2026-08-01T10:00:00.000Z"),
			healthcareProvider: {
				...makeUser({
					id: "provider-1",
					role: "HEALTHCARE_PROVIDER",
					displayName: "Dr. Ana",
				}),
				procedures: [],
				professionalCouncil: null,
			},
		},
	],
});

const mockCategoryRepository = {
	findById: mock((_: string): Promise<CategoryWithProfessionals | null> =>
		Promise.resolve(makeCategory()),
	),
};

const mockNextAvailable = mock(() => Promise.resolve(new Map<string, Date | null>()));
const mockRatings = mock(() =>
	Promise.resolve(
		new Map<string, { averageRating: number; totalRatings: number }>([
			["provider-1", { averageRating: 5, totalRatings: 1 }],
		]),
	),
);

mock.module(
	"@/http/repositories/categories/categories-repository-implementation",
	() => ({
		prismaCategoryRepository: mockCategoryRepository,
	}),
);
mock.module("@/http/useCases/healthcare-providers/get-next-available-slots", () => ({
	getNextAvailableSlotsByProviderIds: mockNextAvailable,
}));
mock.module("@/http/useCases/ratings/get-provider-rating-summaries", () => ({
	getProviderRatingSummariesByProviderIds: mockRatings,
}));

const { getCategoryByIdUseCase } = await import("./index");

describe("getCategoryByIdUseCase", () => {
	beforeEach(() => {
		mockCategoryRepository.findById.mockReset();
		mockNextAvailable.mockReset();
		mockRatings.mockReset();
		mockCategoryRepository.findById.mockResolvedValue(makeCategory());
		mockNextAvailable.mockResolvedValue(new Map<string, Date | null>());
		mockRatings.mockResolvedValue(
			new Map<string, { averageRating: number; totalRatings: number }>([
				["provider-1", { averageRating: 5, totalRatings: 1 }],
			]),
		);
	});

	test("returns presented category by id", async () => {
		const result = await getCategoryByIdUseCase.execute("category-1");

		expect(mockCategoryRepository.findById).toHaveBeenCalledWith("category-1");
		expect(result.category).toMatchObject({
			id: "category-1",
			name: "Cardiologia",
		});
	});

	test("throws when category does not exist", async () => {
		mockCategoryRepository.findById.mockResolvedValue(null);

		await expect(getCategoryByIdUseCase.execute("missing")).rejects.toThrow(
			"Category not found",
		);
	});
});
