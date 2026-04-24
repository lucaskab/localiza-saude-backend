import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockPrisma: any = {
	healthcare_provider: {
		findUnique: mock(() => Promise.resolve({ id: "provider-1" })),
	},
	procedure: {
		findMany: mock(() => Promise.resolve([])),
	},
	healthcare_provider_schedule: {
		findFirst: mock(() => Promise.resolve(null)),
	},
};

const mockAppointmentRepository: any = {
	findByProviderAndDateRange: mock(() => Promise.resolve([])),
};

mock.module("@/database/prisma", () => ({
	prisma: mockPrisma,
}));

mock.module(
	"@/http/repositories/appointments/appointments-repository-implementation",
	() => ({
		prismaAppointmentRepository: mockAppointmentRepository,
	}),
);

const { getTimeSlotsUseCase } = await import("../get-time-slots-use-case");

const selectedProcedure = {
	id: "procedure-1",
	durationInMinutes: 60,
};

const shortestProcedure = {
	id: "procedure-2",
	durationInMinutes: 30,
};

describe("Get Time Slots Use Case", () => {
	beforeEach(() => {
		mockPrisma.healthcare_provider.findUnique.mockResolvedValue({
			id: "provider-1",
		});
		mockPrisma.procedure.findMany.mockImplementation((args: any) => {
			if (args?.where?.id?.in) {
				return Promise.resolve([selectedProcedure]);
			}

			return Promise.resolve([shortestProcedure, selectedProcedure]);
		});
		mockPrisma.healthcare_provider_schedule.findFirst.mockResolvedValue({
			dayOfWeek: 1,
			startTime: "09:00",
			endTime: "12:00",
			isActive: true,
		});
		mockAppointmentRepository.findByProviderAndDateRange.mockResolvedValue([]);
	});

	test("marks slots unavailable when the requested appointment duration overlaps an existing appointment", async () => {
		mockAppointmentRepository.findByProviderAndDateRange.mockResolvedValue([
			{
				scheduledAt: new Date("2026-04-20T09:30:00.000Z"),
				totalDurationMinutes: 30,
			},
		]);

		const result = await getTimeSlotsUseCase.execute({
			healthcareProviderId: "provider-1",
			date: "2026-04-20",
			procedureIds: ["procedure-1"],
		});

		expect(result.slots.find((slot) => slot.startTime === "09:00")).toMatchObject(
			{
				available: false,
			},
		);
		expect(result.slots.find((slot) => slot.startTime === "09:30")).toMatchObject(
			{
				available: false,
			},
		);
		expect(result.slots.find((slot) => slot.startTime === "10:00")).toMatchObject(
			{
				available: true,
			},
		);
	});

	test("uses the selected UTC date when finding the weekday and existing appointments", async () => {
		await getTimeSlotsUseCase.execute({
			healthcareProviderId: "provider-1",
			date: "2026-04-20",
			procedureIds: ["procedure-1"],
		});

		expect(mockPrisma.healthcare_provider_schedule.findFirst).toHaveBeenCalledWith({
			where: {
				healthcareProviderId: "provider-1",
				dayOfWeek: 1,
				isActive: true,
			},
		});
		expect(
			mockAppointmentRepository.findByProviderAndDateRange,
		).toHaveBeenCalledWith("provider-1", {
			startDate: new Date("2026-04-20T00:00:00.000Z"),
			endDate: new Date("2026-04-20T23:59:59.999Z"),
		});
	});
});
