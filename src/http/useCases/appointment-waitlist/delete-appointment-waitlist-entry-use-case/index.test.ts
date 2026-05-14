import { beforeEach, describe, expect, mock, test } from "bun:test";
import { makeUser } from "@/http/tests/factories";

type WaitlistEntry = {
	id: string;
	customerId: string;
};

const mockWaitlistRepository = {
	findById: mock((_: string): Promise<WaitlistEntry | null> =>
		Promise.resolve({
			id: "waitlist-1",
			customerId: "customer-1",
		}),
	),
	cancel: mock((_: string): Promise<void> => Promise.resolve()),
};

mock.module(
	"@/http/repositories/appointment-waitlist/appointment-waitlist-repository-implementation",
	() => ({
		prismaAppointmentWaitlistRepository: mockWaitlistRepository,
	}),
);

const { deleteAppointmentWaitlistEntryUseCase } = await import("./index");

describe("deleteAppointmentWaitlistEntryUseCase", () => {
	beforeEach(() => {
		mockWaitlistRepository.findById.mockReset();
		mockWaitlistRepository.cancel.mockReset();
		mockWaitlistRepository.findById.mockResolvedValue({
			id: "waitlist-1",
			customerId: "customer-1",
		});
		mockWaitlistRepository.cancel.mockResolvedValue(undefined);
	});

	test("allows the owner to leave the waitlist", async () => {
		await deleteAppointmentWaitlistEntryUseCase.execute(
			makeUser({ id: "customer-1", role: "CUSTOMER" }),
			"waitlist-1",
		);

		expect(mockWaitlistRepository.cancel).toHaveBeenCalledWith("waitlist-1");
	});

	test("allows admins to remove any entry", async () => {
		await deleteAppointmentWaitlistEntryUseCase.execute(
			makeUser({ id: "admin-1", role: "ADMIN" }),
			"waitlist-1",
		);

		expect(mockWaitlistRepository.cancel).toHaveBeenCalledWith("waitlist-1");
	});

	test("rejects unrelated actors", async () => {
		await expect(
			deleteAppointmentWaitlistEntryUseCase.execute(
				makeUser({ id: "customer-2", role: "CUSTOMER" }),
				"waitlist-1",
			),
		).rejects.toThrow("You cannot leave this waitlist entry");
	});
});
