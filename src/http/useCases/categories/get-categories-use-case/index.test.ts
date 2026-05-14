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
					specialty: "Cardiologia",
				}),
				procedures: [
					{
						id: "procedure-1",
						name: "Consulta inicial",
						description: null,
						priceInCents: 15000,
						durationInMinutes: 60,
						healthcareProviderId: "provider-1",
						createdAt: new Date("2026-08-01T10:00:00.000Z"),
						updatedAt: new Date("2026-08-01T10:00:00.000Z"),
					},
				],
				professionalCouncil: null,
			},
		},
	],
});

const mockCategoryRepository = {
	findAll: mock((): Promise<CategoryWithProfessionals[]> => Promise.resolve([])),
};

const mockNextAvailable = mock(() =>
	Promise.resolve(new Map<string, Date | null>([["provider-1", new Date("2026-08-20T10:00:00.000Z")]])),
);
const mockRatings = mock(() =>
	Promise.resolve(
		new Map<string, { averageRating: number; totalRatings: number }>([
			["provider-1", { averageRating: 4.5, totalRatings: 2 }],
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

const { getCategoriesUseCase } = await import("./index");

describe("getCategoriesUseCase", () => {
	beforeEach(() => {
		mockCategoryRepository.findAll.mockReset();
		mockNextAvailable.mockReset();
		mockRatings.mockReset();
		mockCategoryRepository.findAll.mockResolvedValue([]);
		mockNextAvailable.mockResolvedValue(
			new Map<string, Date | null>([["provider-1", new Date("2026-08-20T10:00:00.000Z")]]),
		);
		mockRatings.mockResolvedValue(
			new Map<string, { averageRating: number; totalRatings: number }>([
				["provider-1", { averageRating: 4.5, totalRatings: 2 }],
			]),
		);
	});

	test("returns presented categories with provider enrichments", async () => {
		mockCategoryRepository.findAll.mockResolvedValue([makeCategory()]);

		const result = await getCategoriesUseCase.execute();

		expect(mockNextAvailable).toHaveBeenCalledWith(["provider-1"]);
		expect(mockRatings).toHaveBeenCalledWith(["provider-1"]);
		expect(result.categories[0]?.healthcareProviders[0]).toMatchObject({
			id: "provider-1",
			displayName: "Dr. Ana",
			startingPriceCents: 15000,
			averageRating: 4.5,
			totalRatings: 2,
		});
	});
});
