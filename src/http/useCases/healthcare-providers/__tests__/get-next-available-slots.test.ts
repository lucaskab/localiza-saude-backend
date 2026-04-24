import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockPrisma: any = {
	procedure: {
		findMany: mock(() => Promise.resolve([])),
	},
	healthcare_provider_schedule: {
		findMany: mock(() => Promise.resolve([])),
	},
	appointment: {
		findMany: mock(() => Promise.resolve([])),
	},
};

mock.module("@/database/prisma", () => ({
	prisma: mockPrisma,
}));

const { getNextAvailableSlotsByProviderIds } = await import(
	"../get-next-available-slots"
);

describe("Get Next Available Slots", () => {
	beforeEach(() => {
		mockPrisma.procedure.findMany.mockResolvedValue([
			{
				healthcareProviderId: "provider-1",
				durationInMinutes: 30,
			},
		]);
		mockPrisma.healthcare_provider_schedule.findMany.mockResolvedValue([
			{
				healthcareProviderId: "provider-1",
				dayOfWeek: 1,
				startTime: "09:00",
				endTime: "10:00",
			},
		]);
		mockPrisma.appointment.findMany.mockResolvedValue([]);
	});

	test("returns the first future slot that is not blocked by an appointment", async () => {
		mockPrisma.appointment.findMany.mockResolvedValue([
			{
				healthcareProviderId: "provider-1",
				scheduledAt: new Date("2026-04-20T09:00:00.000Z"),
				totalDurationMinutes: 30,
			},
		]);

		const result = await getNextAvailableSlotsByProviderIds(["provider-1"], {
			now: new Date("2026-04-20T08:45:00.000Z"),
			daysAhead: 1,
		});

		expect(result.get("provider-1")).toEqual(
			new Date("2026-04-20T09:30:00.000Z"),
		);
	});

	test("returns null when a provider has no bookable procedure", async () => {
		mockPrisma.procedure.findMany.mockResolvedValue([]);

		const result = await getNextAvailableSlotsByProviderIds(["provider-1"], {
			now: new Date("2026-04-20T08:45:00.000Z"),
			daysAhead: 1,
		});

		expect(result.get("provider-1")).toBeNull();
	});
});
