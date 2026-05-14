import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { FavoriteProviderWithRelations } from "@/http/repositories/favorites/favorites-repository-contract";
import { makeUser } from "@/http/tests/factories";
import type { customer_favorite_provider } from "../../../../../prisma/generated/prisma/client";

const mockFavoriteRepository = {
	add: mock((customerId: string, providerId: string): Promise<customer_favorite_provider> =>
		Promise.resolve({
			createdAt: new Date(),
			customerId,
			healthcareProviderId: providerId,
		}),
	),
};

const mockProviderRepository = {
	findById: mock(
		(_: string): Promise<FavoriteProviderWithRelations["healthcareProvider"] | null> =>
			Promise.resolve({
				...makeUser({
					id: "provider-1",
					role: "HEALTHCARE_PROVIDER",
				}),
				procedures: [],
				faqs: [],
				professionalCouncil: null,
			}),
	),
};

mock.module("@/http/repositories/favorites/favorites-repository-implementation", () => ({
	prismaFavoriteRepository: mockFavoriteRepository,
}));

mock.module(
	"@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation",
	() => ({
		prismaHealthcareProviderRepository: mockProviderRepository,
	}),
);

const { addFavoriteUseCase } = await import("./index");

describe("addFavoriteUseCase", () => {
	beforeEach(() => {
		mockFavoriteRepository.add.mockReset();
		mockProviderRepository.findById.mockReset();
		mockProviderRepository.findById.mockResolvedValue({
			...makeUser({
				id: "provider-1",
				role: "HEALTHCARE_PROVIDER",
			}),
			procedures: [],
			faqs: [],
			professionalCouncil: null,
		});
		mockFavoriteRepository.add.mockImplementation(
			(customerId: string, providerId: string): Promise<customer_favorite_provider> =>
				Promise.resolve({
					createdAt: new Date(),
					customerId,
					healthcareProviderId: providerId,
				}),
		);
	});

	test("adds favorite when provider exists", async () => {
		const result = await addFavoriteUseCase.execute({
			customerId: "customer-1",
			healthcareProviderId: "provider-1",
		});

		expect(mockFavoriteRepository.add).toHaveBeenCalledWith(
			"customer-1",
			"provider-1",
		);
		expect(result.favorite).toEqual({
			customerId: "customer-1",
			healthcareProviderId: "provider-1",
		});
	});

	test("throws when provider is missing", async () => {
		mockProviderRepository.findById.mockResolvedValue(null);

		await expect(
			addFavoriteUseCase.execute({
				customerId: "customer-1",
				healthcareProviderId: "provider-1",
			}),
		).rejects.toThrow("Healthcare provider not found");
	});
});
