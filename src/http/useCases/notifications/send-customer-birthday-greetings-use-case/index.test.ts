import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { AppointmentForNotification } from "@/http/repositories/notifications/notifications-repository-contract";
import { makeUser } from "@/http/tests/factories";
import type { notification_delivery } from "../../../../../prisma/generated/prisma/client";

const makeBirthdayCandidate = (
	overrides: Partial<AppointmentForNotification> = {},
): AppointmentForNotification => ({
	id: "appointment-1",
	createdAt: new Date("2026-05-01T10:00:00.000Z"),
	updatedAt: new Date("2026-05-01T10:00:00.000Z"),
	customerId: "customer-1",
	customer: makeUser({
		id: "customer-1",
		role: "CUSTOMER",
		name: "Lucas Furini",
		firstName: "Lucas",
		email: "lucas@example.com",
		dateOfBirth: new Date("1992-05-14T12:00:00.000Z"),
	}),
	patientProfileId: null,
	patientProfile: null,
	healthcareProviderId: "provider-1",
	healthcareProvider: makeUser({
		id: "provider-1",
		role: "HEALTHCARE_PROVIDER",
		name: "Dra. Ana Souza",
		displayName: "Dra. Ana Souza",
		birthdayGreetingEmailEnabled: true,
	}),
	recurringSeriesId: null,
	recurringRuleId: null,
	recurringGeneratedAt: null,
	scheduledAt: new Date("2026-05-20T13:00:00.000Z"),
	status: "CONFIRMED",
	serviceModality: "ONLINE",
	onlineMeetingUrl: null,
	onlineMeetingProvider: null,
	onlineMeetingExternalId: null,
	onlineMeetingCreatedAt: null,
	totalDurationMinutes: 60,
	totalPriceCents: 20000,
	notes: null,
	cancellationReason: null,
	cancellationFeeCents: null,
	cancellationPolicyAppliedAt: null,
	cancelledAt: null,
	cancelledByUserId: null,
	...overrides,
});

type SendEmailResult = {
	status: "sent" | "skipped" | "failed";
	id?: string;
	errorMessage?: string;
};

const mockNotificationsRepository = {
	findBirthdayGreetingCandidates: mock(
		(): Promise<AppointmentForNotification[]> => Promise.resolve([]),
	),
	findDelivery: mock(
		(
			_: string,
			__: "CUSTOMER_BIRTHDAY_GREETING",
			___: "EMAIL",
			____: string,
		): Promise<notification_delivery | null> => Promise.resolve(null),
		),
	createDelivery: mock(() => Promise.resolve(undefined)),
};

const mockEmailService = {
	send: mock(
		(): Promise<SendEmailResult> =>
			Promise.resolve({
				status: "sent",
				id: "email-1",
			}),
	),
};

mock.module(
	"@/http/repositories/notifications/notifications-repository-implementation",
	() => ({
		prismaNotificationsRepository: mockNotificationsRepository,
	}),
);

mock.module("@/http/services/email.service", () => ({
	emailService: mockEmailService,
}));

const { sendCustomerBirthdayGreetingsUseCase } = await import("./index");

describe("sendCustomerBirthdayGreetingsUseCase", () => {
	beforeEach(() => {
		mockNotificationsRepository.findBirthdayGreetingCandidates.mockReset();
		mockNotificationsRepository.findDelivery.mockReset();
		mockNotificationsRepository.createDelivery.mockReset();
		mockEmailService.send.mockReset();

		mockNotificationsRepository.findBirthdayGreetingCandidates.mockResolvedValue(
			[],
		);
		mockNotificationsRepository.findDelivery.mockResolvedValue(null);
		mockNotificationsRepository.createDelivery.mockResolvedValue(undefined);
		mockEmailService.send.mockResolvedValue({
			status: "sent",
			id: "email-1",
		});
	});

	test("returns empty summary when there are no eligible customers", async () => {
		const result = await sendCustomerBirthdayGreetingsUseCase.execute(
			new Date("2026-05-14T09:00:00.000Z"),
		);

		expect(result).toEqual({
			processed: 0,
			sent: 0,
			skipped: 0,
			failed: 0,
		});
	});

	test("sends a birthday email when the date matches and no prior delivery exists", async () => {
		mockNotificationsRepository.findBirthdayGreetingCandidates.mockResolvedValue([
			makeBirthdayCandidate(),
		]);

		const result = await sendCustomerBirthdayGreetingsUseCase.execute(
			new Date("2026-05-14T09:00:00.000Z"),
		);

		expect(mockEmailService.send).toHaveBeenCalledWith(
			expect.objectContaining({
				to: "lucas@example.com",
				subject: "Feliz aniversário, Lucas!",
				idempotencyKey: "birthday:provider-1:2026",
			}),
		);
		expect(mockNotificationsRepository.createDelivery).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: "customer-1",
				type: "CUSTOMER_BIRTHDAY_GREETING",
				channel: "EMAIL",
				dedupeKey: "birthday:provider-1:2026",
				status: "SENT",
			}),
		);
		expect(result).toEqual({
			processed: 1,
			sent: 1,
			skipped: 0,
			failed: 0,
		});
	});

	test("skips customers whose birthday does not match the current day", async () => {
		mockNotificationsRepository.findBirthdayGreetingCandidates.mockResolvedValue([
			makeBirthdayCandidate({
				customer: makeUser({
					id: "customer-1",
					role: "CUSTOMER",
					name: "Lucas Furini",
					firstName: "Lucas",
					email: "lucas@example.com",
					dateOfBirth: new Date("1992-09-21T12:00:00.000Z"),
				}),
			}),
		]);

		const result = await sendCustomerBirthdayGreetingsUseCase.execute(
			new Date("2026-05-14T09:00:00.000Z"),
		);

		expect(mockEmailService.send).not.toHaveBeenCalled();
		expect(result).toEqual({
			processed: 1,
			sent: 0,
			skipped: 1,
			failed: 0,
		});
	});

	test("skips when the greeting was already sent for the same provider in the year", async () => {
		mockNotificationsRepository.findBirthdayGreetingCandidates.mockResolvedValue([
			makeBirthdayCandidate(),
		]);
		mockNotificationsRepository.findDelivery.mockResolvedValue(
			{ id: "delivery-1" } as notification_delivery,
		);

		const result = await sendCustomerBirthdayGreetingsUseCase.execute(
			new Date("2026-05-14T09:00:00.000Z"),
		);

		expect(mockEmailService.send).not.toHaveBeenCalled();
		expect(result).toEqual({
			processed: 1,
			sent: 0,
			skipped: 1,
			failed: 0,
		});
	});

	test("counts failed birthday email deliveries and stores the failed delivery", async () => {
		mockNotificationsRepository.findBirthdayGreetingCandidates.mockResolvedValue([
			makeBirthdayCandidate(),
		]);
		mockEmailService.send.mockResolvedValue({
			status: "failed",
			errorMessage: "Resend request failed",
		});

		const result = await sendCustomerBirthdayGreetingsUseCase.execute(
			new Date("2026-05-14T09:00:00.000Z"),
		);

		expect(mockNotificationsRepository.createDelivery).toHaveBeenCalledWith(
			expect.objectContaining({
				channel: "EMAIL",
				status: "FAILED",
				errorMessage: "Resend request failed",
			}),
		);
		expect(result).toEqual({
			processed: 1,
			sent: 0,
			skipped: 0,
			failed: 1,
		});
	});

	test("skips entries without customer email or birth date", async () => {
		mockNotificationsRepository.findBirthdayGreetingCandidates.mockResolvedValue([
			makeBirthdayCandidate({
				customer: makeUser({
					id: "customer-1",
					role: "CUSTOMER",
					name: "Lucas Furini",
					firstName: "Lucas",
					dateOfBirth: null,
				}),
			}),
		]);

		const result = await sendCustomerBirthdayGreetingsUseCase.execute(
			new Date("2026-05-14T09:00:00.000Z"),
		);

		expect(mockEmailService.send).not.toHaveBeenCalled();
		expect(result).toEqual({
			processed: 1,
			sent: 0,
			skipped: 1,
			failed: 0,
		});
	});
});
