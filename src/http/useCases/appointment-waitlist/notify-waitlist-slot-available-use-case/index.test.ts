import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockWaitlistRepository: any = {
	findMatchingForCancelledAppointment: mock((): Promise<any[]> => Promise.resolve([])),
	markNotified: mock(() => Promise.resolve(undefined)),
};

const mockEmailService = {
	send: mock(() => Promise.resolve(undefined)),
};

const mockPushNotificationsService = {
	sendToUser: mock(() => Promise.resolve(undefined)),
};

mock.module("@/env", () => ({
	env: {
		WEB_APP_URL: "https://app.localizasaude.test",
	},
}));

mock.module(
	"@/http/repositories/appointment-waitlist/appointment-waitlist-repository-implementation",
	() => ({
		prismaAppointmentWaitlistRepository: mockWaitlistRepository,
	}),
);

mock.module("@/http/services/email.service", () => ({
	emailService: mockEmailService,
}));

mock.module("@/http/services/push-notifications.service", () => ({
	pushNotificationsService: mockPushNotificationsService,
}));

const { notifyWaitlistSlotAvailableUseCase } = await import("./index");

describe("notifyWaitlistSlotAvailableUseCase", () => {
	beforeEach(() => {
		mockWaitlistRepository.findMatchingForCancelledAppointment.mockReset();
		mockWaitlistRepository.markNotified.mockReset();
		mockEmailService.send.mockReset();
		mockPushNotificationsService.sendToUser.mockReset();
		mockWaitlistRepository.findMatchingForCancelledAppointment.mockResolvedValue([]);
		mockWaitlistRepository.markNotified.mockResolvedValue(undefined);
		mockEmailService.send.mockResolvedValue(undefined);
		mockPushNotificationsService.sendToUser.mockResolvedValue(undefined);
	});

	test("returns early when cancelled appointment is in the past", async () => {
		await notifyWaitlistSlotAvailableUseCase.execute({
			id: "appointment-past",
			scheduledAt: new Date("2020-01-01T10:00:00.000Z"),
			totalDurationMinutes: 60,
		} as any);

		expect(
			mockWaitlistRepository.findMatchingForCancelledAppointment,
		).not.toHaveBeenCalled();
	});

	test("notifies matching waitlist entries and marks them as notified", async () => {
		mockWaitlistRepository.findMatchingForCancelledAppointment.mockResolvedValue([
			{
				id: "wait-1",
				customerId: "customer-1",
				healthcareProviderId: "provider-1",
				desiredScheduledAt: new Date("2026-08-20T10:00:00.000Z"),
				customer: {
					name: "Lucas",
					email: "lucas@example.com",
				},
				healthcareProvider: {
					name: "Dr. Ana",
				},
				procedures: [
					{
						procedureId: "proc-1",
						procedure: {
							durationInMinutes: 30,
						},
					},
				],
			},
		]);

		await notifyWaitlistSlotAvailableUseCase.execute({
			id: "appointment-1",
			scheduledAt: new Date("2026-08-20T10:00:00.000Z"),
			totalDurationMinutes: 60,
			healthcareProvider: {
				name: "Dr. Ana",
			},
		} as any);

		expect(mockPushNotificationsService.sendToUser).toHaveBeenCalledTimes(1);
		expect(mockEmailService.send).toHaveBeenCalledTimes(1);
		expect(mockWaitlistRepository.markNotified).toHaveBeenCalledWith("wait-1");
	});

	test("skips entries whose procedures do not fit in the freed slot", async () => {
		mockWaitlistRepository.findMatchingForCancelledAppointment.mockResolvedValue([
			{
				id: "wait-2",
				customerId: "customer-2",
				healthcareProviderId: "provider-1",
				desiredScheduledAt: new Date("2026-08-20T10:00:00.000Z"),
				customer: {
					name: "Maria",
					email: "maria@example.com",
				},
				healthcareProvider: {
					name: "Dr. Ana",
				},
				procedures: [
					{
						procedureId: "proc-1",
						procedure: {
							durationInMinutes: 90,
						},
					},
				],
			},
		]);

		await notifyWaitlistSlotAvailableUseCase.execute({
			id: "appointment-2",
			scheduledAt: new Date("2026-08-20T10:00:00.000Z"),
			totalDurationMinutes: 60,
			healthcareProvider: {
				name: "Dr. Ana",
			},
		} as any);

		expect(mockPushNotificationsService.sendToUser).not.toHaveBeenCalled();
		expect(mockEmailService.send).not.toHaveBeenCalled();
		expect(mockWaitlistRepository.markNotified).not.toHaveBeenCalled();
	});
});
