import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockFavoriteRepository = {
	remove: mock(() => Promise.resolve(undefined)),
};

mock.module("@/http/repositories/favorites/favorites-repository-implementation", () => ({
	prismaFavoriteRepository: mockFavoriteRepository,
}));

const { removeFavoriteUseCase } = await import("./index");

describe("removeFavoriteUseCase", () => {
	beforeEach(() => {
		mockFavoriteRepository.remove.mockReset();
		mockFavoriteRepository.remove.mockResolvedValue(undefined);
	});

	test("removes favorite and returns success message", async () => {
		const result = await removeFavoriteUseCase.execute({
			customerId: "customer-1",
			healthcareProviderId: "provider-1",
		});

		expect(mockFavoriteRepository.remove).toHaveBeenCalledWith(
			"customer-1",
			"provider-1",
		);
		expect(result.message).toBe("Favorite removed successfully");
	});
});
