import { beforeEach, describe, expect, mock, test } from "bun:test";
import { makeUser } from "@/http/tests/factories";

type ProcedureSelection = { id: string };

const mockPrisma = {
	procedure: {
		findMany: mock((): Promise<ProcedureSelection[]> => Promise.resolve([])),
	},
};

type WaitlistUpsertData = {
	customerId: string;
	healthcareProviderId: string;
	desiredScheduledAt: Date;
	procedureIds: string[];
};

const mockWaitlistRepository = {
	upsertActive: mock((data: WaitlistUpsertData) =>
		Promise.resolve({ id: "waitlist-1", ...data }),
	),
};

mock.module("@/database/prisma", () => ({
	prisma: mockPrisma,
}));

mock.module(
	"@/http/repositories/appointment-waitlist/appointment-waitlist-repository-implementation",
	() => ({
		prismaAppointmentWaitlistRepository: mockWaitlistRepository,
	}),
);

const { createAppointmentWaitlistEntryUseCase } = await import("./index");

describe("createAppointmentWaitlistEntryUseCase", () => {
	beforeEach(() => {
		mockPrisma.procedure.findMany.mockReset();
		mockWaitlistRepository.upsertActive.mockReset();
		mockPrisma.procedure.findMany.mockResolvedValue([
			{ id: "procedure-1" },
			{ id: "procedure-2" },
		]);
		mockWaitlistRepository.upsertActive.mockImplementation((data: WaitlistUpsertData) =>
			Promise.resolve({ id: "waitlist-1", ...data }),
		);
	});

	test("creates waitlist entry for a customer", async () => {
		const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
		const result = await createAppointmentWaitlistEntryUseCase.execute(
			makeUser({ id: "customer-1", role: "CUSTOMER" }),
			{
				healthcareProviderId: "provider-1",
				scheduledAt,
				procedureIds: ["procedure-1", "procedure-2"],
			},
		);

		expect(mockWaitlistRepository.upsertActive).toHaveBeenCalledWith({
			customerId: "customer-1",
			healthcareProviderId: "provider-1",
			desiredScheduledAt: scheduledAt,
			procedureIds: ["procedure-1", "procedure-2"],
		});
		expect(result.waitlistEntry.id).toBe("waitlist-1");
	});

	test("rejects non-customer actors", async () => {
		await expect(
			createAppointmentWaitlistEntryUseCase.execute(
				makeUser({ id: "provider-1", role: "HEALTHCARE_PROVIDER" }),
				{
					healthcareProviderId: "provider-1",
					scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
					procedureIds: ["procedure-1"],
				},
			),
		).rejects.toThrow("Only customers can join the waitlist");
	});

	test("rejects procedures that do not belong to the provider", async () => {
		mockPrisma.procedure.findMany.mockResolvedValue([{ id: "procedure-1" }]);

		await expect(
			createAppointmentWaitlistEntryUseCase.execute(
				makeUser({ id: "customer-1", role: "CUSTOMER" }),
				{
					healthcareProviderId: "provider-1",
					scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
					procedureIds: ["procedure-1", "procedure-2"],
				},
			),
		).rejects.toThrow(
			"One or more procedures do not belong to this provider",
		);
	});
});
