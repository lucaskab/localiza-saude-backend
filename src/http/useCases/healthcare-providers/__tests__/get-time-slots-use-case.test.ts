import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockPrisma: any = {
	user: {
		findUnique: mock(() => Promise.resolve({ id: "provider-1" })),
		findFirst: mock(() =>
			Promise.resolve({
				id: "provider-1",
				role: "HEALTHCARE_PROVIDER",
				bookingAvailabilityDays: 60,
			}),
		),
	},
	procedure: {
		findMany: mock(() => Promise.resolve([])),
	},
	appointment_recurring_series: {
		findMany: mock(() => Promise.resolve([])),
	},
	healthcare_provider_schedule: {
		findFirst: mock(() => Promise.resolve(null)),
		findMany: mock(() => Promise.resolve([])),
	},
	healthcare_provider_schedule_exception: {
		findMany: mock(() => Promise.resolve([])),
	},
};

const mockAppointmentRepository: any = {
	findByProfessionalAndDateRange: mock(() => Promise.resolve([])),
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
		mockPrisma.user.findUnique.mockResolvedValue({
			id: "provider-1",
		});
		mockPrisma.user.findFirst.mockResolvedValue({
			id: "provider-1",
			role: "HEALTHCARE_PROVIDER",
			bookingAvailabilityDays: 60,
		});
		mockPrisma.procedure.findMany.mockImplementation((args: any) => {
			if (args?.where?.id?.in) {
				return Promise.resolve([selectedProcedure]);
			}

			return Promise.resolve([shortestProcedure, selectedProcedure]);
		});
		mockPrisma.appointment_recurring_series.findMany.mockResolvedValue([]);
		mockPrisma.healthcare_provider_schedule.findFirst.mockResolvedValue({
			dayOfWeek: 1,
			startTime: "09:00",
			endTime: "12:00",
			isActive: true,
		});
		mockPrisma.healthcare_provider_schedule.findMany.mockResolvedValue([
			{
				dayOfWeek: 1,
				startTime: "09:00",
				endTime: "12:00",
				isActive: true,
			},
		]);
		mockPrisma.healthcare_provider_schedule_exception.findMany.mockResolvedValue(
			[],
		);
		mockAppointmentRepository.findByProfessionalAndDateRange.mockResolvedValue([]);
	});

	test("marks slots unavailable when the requested appointment duration overlaps an existing appointment", async () => {
		mockAppointmentRepository.findByProfessionalAndDateRange.mockResolvedValue([
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

		expect(mockPrisma.healthcare_provider_schedule.findMany).toHaveBeenCalledWith({
			where: {
				healthcareProviderId: "provider-1",
				dayOfWeek: 1,
				isActive: true,
			},
			orderBy: {
				startTime: "asc",
			},
		});
		expect(
			mockAppointmentRepository.findByProfessionalAndDateRange,
		).toHaveBeenCalledWith("provider-1", {
			startDate: new Date("2026-04-20T00:00:00.000Z"),
			endDate: new Date("2026-04-20T23:59:59.999Z"),
		});
	});

	test("marks slots from earlier today as unavailable in Sao Paulo time", async () => {
		mockPrisma.healthcare_provider_schedule.findMany.mockResolvedValue([
			{
				dayOfWeek: 1,
				startTime: "09:00",
				endTime: "18:00",
				isActive: true,
			},
		]);
		const realDate = Date;
		const frozenNow = new realDate("2026-04-20T19:00:00.000Z");

		class MockDate extends realDate {
			constructor(value?: string | number | Date) {
				super(value ?? frozenNow);
			}

			static now() {
				return frozenNow.getTime();
			}
		}

		globalThis.Date = MockDate as typeof Date;

		try {
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
			expect(result.slots.find((slot) => slot.startTime === "15:30")).toMatchObject(
				{
					available: false,
				},
			);
			expect(result.slots.find((slot) => slot.startTime === "16:00")).toMatchObject(
				{
					available: true,
				},
			);
		} finally {
			globalThis.Date = realDate;
		}
	});
});
