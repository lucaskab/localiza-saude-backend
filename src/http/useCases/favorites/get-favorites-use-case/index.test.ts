import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { FavoriteProviderWithRelations } from "@/http/repositories/favorites/favorites-repository-contract";
import { makeUser } from "@/http/tests/factories";

type ProcedureSelection = {
	healthcareProviderId: string;
	durationInMinutes: number;
};

type ScheduleSelection = {
	healthcareProviderId: string;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
};

type AppointmentSelection = {
	healthcareProviderId: string;
	scheduledAt: Date;
	totalDurationMinutes: number;
};

type RatingSelection = {
	healthcareProviderId: string;
	rating: number;
};

const mockFavoriteRepository = {
	findByUserId: mock(
		(_: string): Promise<FavoriteProviderWithRelations[]> => Promise.resolve([]),
	),
};

const mockPrisma = {
	procedure: {
		findMany: mock((): Promise<ProcedureSelection[]> => Promise.resolve([])),
	},
	healthcare_provider_schedule: {
		findMany: mock((): Promise<ScheduleSelection[]> => Promise.resolve([])),
	},
	appointment: {
		findMany: mock((): Promise<AppointmentSelection[]> => Promise.resolve([])),
	},
	rating: {
		findMany: mock((): Promise<RatingSelection[]> => Promise.resolve([])),
	},
};

mock.module("@/http/repositories/favorites/favorites-repository-implementation", () => ({
	prismaFavoriteRepository: mockFavoriteRepository,
}));
mock.module("@/database/prisma", () => ({
	prisma: mockPrisma,
}));

const { getFavoritesUseCase } = await import("./index");

describe("getFavoritesUseCase", () => {
	beforeEach(() => {
		mockFavoriteRepository.findByUserId.mockReset();
		mockPrisma.procedure.findMany.mockReset();
		mockPrisma.healthcare_provider_schedule.findMany.mockReset();
		mockPrisma.appointment.findMany.mockReset();
		mockPrisma.rating.findMany.mockReset();
		mockFavoriteRepository.findByUserId.mockResolvedValue([]);
		mockPrisma.procedure.findMany.mockResolvedValue([]);
		mockPrisma.healthcare_provider_schedule.findMany.mockResolvedValue([]);
		mockPrisma.appointment.findMany.mockResolvedValue([]);
		mockPrisma.rating.findMany.mockResolvedValue([]);
	});

	test("returns empty favorites when user has no favorites", async () => {
		const result = await getFavoritesUseCase.execute("customer-1");

		expect(result.favorites).toEqual([]);
	});

	test("enriches favorites with rating and next availability", async () => {
		const now = new Date();
		const nextStart = new Date(now);
		nextStart.setUTCMinutes(0, 0, 0);
		nextStart.setUTCHours(now.getUTCHours() + 2);

		mockFavoriteRepository.findByUserId.mockResolvedValue([
			{
				createdAt: new Date(),
				customerId: "customer-1",
				healthcareProviderId: "provider-1",
				healthcareProvider: {
					...makeUser({
						id: "provider-1",
						role: "HEALTHCARE_PROVIDER",
						displayName: "Dr. Teste",
					}),
					procedures: [],
					faqs: [],
					professionalCouncil: null,
				},
			},
		]);
		mockPrisma.procedure.findMany.mockResolvedValue([
			{
				healthcareProviderId: "provider-1",
				durationInMinutes: 30,
			},
		]);
		mockPrisma.healthcare_provider_schedule.findMany.mockResolvedValue([
			{
				healthcareProviderId: "provider-1",
				dayOfWeek: nextStart.getUTCDay(),
				startTime: `${String(nextStart.getUTCHours()).padStart(2, "0")}:00`,
				endTime: `${String(nextStart.getUTCHours() + 1).padStart(2, "0")}:00`,
			},
		]);
		mockPrisma.rating.findMany.mockResolvedValue([
			{ healthcareProviderId: "provider-1", rating: 5 },
			{ healthcareProviderId: "provider-1", rating: 4 },
		]);

		const result = await getFavoritesUseCase.execute("customer-1");

		expect(result.favorites[0]).toMatchObject({
			id: "provider-1",
			averageRating: 4.5,
			totalRatings: 2,
		});
		expect(result.favorites[0]?.nextAvailableAt).toBeInstanceOf(Date);
	});
});
