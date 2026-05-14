import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockPrisma: any = {
	rating: {
		findMany: mock((): Promise<any[]> => Promise.resolve([])),
	},
};

mock.module("@/database/prisma", () => ({
	prisma: mockPrisma,
}));

const { getProviderRatingSummariesByProviderIds } = await import("./index");

describe("getProviderRatingSummariesByProviderIds", () => {
	beforeEach(() => {
		mockPrisma.rating.findMany.mockReset();
		mockPrisma.rating.findMany.mockResolvedValue([]);
	});

	test("returns empty summaries for unique provider ids when there are no ratings", async () => {
		const result = await getProviderRatingSummariesByProviderIds([
			"provider-1",
			"provider-1",
			"provider-2",
		]);

		expect(result.get("provider-1")).toEqual({
			averageRating: 0,
			totalRatings: 0,
		});
		expect(result.get("provider-2")).toEqual({
			averageRating: 0,
			totalRatings: 0,
		});
		expect(mockPrisma.rating.findMany).toHaveBeenCalledWith({
			where: {
				healthcareProviderId: {
					in: ["provider-1", "provider-2"],
				},
			},
			select: {
				healthcareProviderId: true,
				rating: true,
			},
		});
	});

	test("calculates average rating and total ratings per provider", async () => {
		mockPrisma.rating.findMany.mockResolvedValue([
			{ healthcareProviderId: "provider-1", rating: 5 },
			{ healthcareProviderId: "provider-1", rating: 3 },
			{ healthcareProviderId: "provider-2", rating: 4 },
		]);

		const result = await getProviderRatingSummariesByProviderIds([
			"provider-1",
			"provider-2",
			"provider-3",
		]);

		expect(result.get("provider-1")).toEqual({
			averageRating: 4,
			totalRatings: 2,
		});
		expect(result.get("provider-2")).toEqual({
			averageRating: 4,
			totalRatings: 1,
		});
		expect(result.get("provider-3")).toEqual({
			averageRating: 0,
			totalRatings: 0,
		});
	});
});
