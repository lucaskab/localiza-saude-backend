import { beforeEach, describe, expect, mock, test } from "bun:test";
import type {
	AppointmentForNotification,
	NotificationPreferenceInput,
} from "@/http/repositories/notifications/notifications-repository-contract";
import { makeUser } from "@/http/tests/factories";
import type { notification_delivery } from "../../../../../prisma/generated/prisma/client";

type SendToUserResult = {
	status: "sent" | "skipped" | "failed";
	expoTicketId?: string | null;
	errorMessage?: string | null;
};

type SendEmailResult = {
	status: "sent" | "skipped" | "failed";
	id?: string;
	errorMessage?: string;
};

const makeAppointment = (
	overrides: Partial<AppointmentForNotification> = {},
): AppointmentForNotification => ({
	id: "appointment-1",
	createdAt: new Date("2026-08-01T10:00:00.000Z"),
	updatedAt: new Date("2026-08-01T10:00:00.000Z"),
	customerId: "customer-1",
	customer: makeUser({
		id: "customer-1",
		role: "CUSTOMER",
		name: "Lucas Furini",
		firstName: "Lucas",
		email: "lucas@example.com",
	}),
	patientProfileId: null,
	patientProfile: null,
	healthcareProviderId: "provider-1",
	healthcareProvider: makeUser({
		id: "provider-1",
		role: "HEALTHCARE_PROVIDER",
		name: "Dra. Ana Souza",
		displayName: "Dra. Ana Souza",
		appointmentConfirmationReminderHoursBefore: 24,
	}),
	recurringSeriesId: null,
	recurringRuleId: null,
	recurringGeneratedAt: null,
	scheduledAt: new Date("2026-08-20T13:00:00.000Z"),
	status: "SCHEDULED",
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

const confirmationPreference = (
	overrides: Partial<NotificationPreferenceInput> = {},
): NotificationPreferenceInput => ({
	type: "APPOINTMENT_CONFIRMATION_REMINDER",
	pushEnabled: true,
	emailEnabled: false,
	...overrides,
});

const mockNotificationsRepository = {
	findUpcomingAppointmentsForReminderWindow: mock(
		(_: Date, __: Date): Promise<AppointmentForNotification[]> =>
			Promise.resolve([]),
	),
	findDelivery: mock(
		(
			_: string,
			__: "APPOINTMENT_CONFIRMATION_REMINDER",
			___: "PUSH" | "EMAIL",
			____: string,
		): Promise<notification_delivery | null> => Promise.resolve(null),
	),
	createDelivery: mock(() => Promise.resolve(undefined)),
};

const mockPushNotificationsService = {
	getPreferences: mock(
		(_: string): Promise<NotificationPreferenceInput[]> =>
			Promise.resolve([confirmationPreference()]),
	),
	sendToUser: mock(
		(): Promise<SendToUserResult> =>
			Promise.resolve({
				status: "sent",
			}),
	),
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

mock.module("@/http/services/push-notifications.service", () => ({
	pushNotificationsService: mockPushNotificationsService,
}));

mock.module("@/http/services/email.service", () => ({
	emailService: mockEmailService,
}));

const { sendDueAppointmentConfirmationRemindersUseCase } = await import("./index");

describe("sendDueAppointmentConfirmationRemindersUseCase", () => {
	beforeEach(() => {
		mockNotificationsRepository.findUpcomingAppointmentsForReminderWindow.mockReset();
		mockNotificationsRepository.findDelivery.mockReset();
		mockNotificationsRepository.createDelivery.mockReset();
		mockPushNotificationsService.getPreferences.mockReset();
		mockPushNotificationsService.sendToUser.mockReset();
		mockEmailService.send.mockReset();

		mockNotificationsRepository.findUpcomingAppointmentsForReminderWindow.mockResolvedValue(
			[],
		);
		mockNotificationsRepository.findDelivery.mockResolvedValue(null);
		mockNotificationsRepository.createDelivery.mockResolvedValue(undefined);
		mockPushNotificationsService.getPreferences.mockResolvedValue([
			confirmationPreference(),
		]);
		mockPushNotificationsService.sendToUser.mockResolvedValue({
			status: "sent",
		});
		mockEmailService.send.mockResolvedValue({
			status: "sent",
			id: "email-1",
		});
	});

	test("returns empty summary when there are no upcoming appointments", async () => {
		const result = await sendDueAppointmentConfirmationRemindersUseCase.execute(
			new Date("2026-08-19T10:00:00.000Z"),
		);

		expect(result).toEqual({
			processed: 0,
			sent: 0,
			skipped: 0,
			failed: 0,
		});
	});

	test("sends push confirmation reminder when appointment enters the provider window", async () => {
		mockNotificationsRepository.findUpcomingAppointmentsForReminderWindow.mockResolvedValue(
			[makeAppointment()],
		);

		const result = await sendDueAppointmentConfirmationRemindersUseCase.execute(
			new Date("2026-08-19T13:30:00.000Z"),
		);

		expect(mockPushNotificationsService.sendToUser).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			processed: 1,
			sent: 1,
			skipped: 0,
			failed: 0,
		});
	});

	test("respects the provider confirmation lead time", async () => {
		mockNotificationsRepository.findUpcomingAppointmentsForReminderWindow.mockResolvedValue(
			[
				makeAppointment({
					healthcareProvider: makeUser({
						id: "provider-1",
						role: "HEALTHCARE_PROVIDER",
						name: "Dra. Ana Souza",
						appointmentConfirmationReminderHoursBefore: 48,
					}),
				}),
			],
		);

		const result = await sendDueAppointmentConfirmationRemindersUseCase.execute(
			new Date("2026-08-18T12:00:00.000Z"),
		);

		expect(mockPushNotificationsService.sendToUser).not.toHaveBeenCalled();
		expect(result).toEqual({
			processed: 1,
			sent: 0,
			skipped: 1,
			failed: 0,
		});
	});

	test("skips appointments that are already confirmed", async () => {
		mockNotificationsRepository.findUpcomingAppointmentsForReminderWindow.mockResolvedValue(
			[makeAppointment({ status: "CONFIRMED" })],
		);

		const result = await sendDueAppointmentConfirmationRemindersUseCase.execute(
			new Date("2026-08-19T13:30:00.000Z"),
		);

		expect(mockPushNotificationsService.sendToUser).not.toHaveBeenCalled();
		expect(mockEmailService.send).not.toHaveBeenCalled();
		expect(result).toEqual({
			processed: 1,
			sent: 0,
			skipped: 1,
			failed: 0,
		});
	});

	test("sends email confirmation reminder when email is enabled", async () => {
		mockNotificationsRepository.findUpcomingAppointmentsForReminderWindow.mockResolvedValue(
			[makeAppointment()],
		);
		mockPushNotificationsService.getPreferences.mockResolvedValue([
			confirmationPreference({ pushEnabled: false, emailEnabled: true }),
		]);

		const result = await sendDueAppointmentConfirmationRemindersUseCase.execute(
			new Date("2026-08-19T13:30:00.000Z"),
		);

		expect(mockEmailService.send).toHaveBeenCalledTimes(1);
		expect(mockNotificationsRepository.createDelivery).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			processed: 1,
			sent: 1,
			skipped: 0,
			failed: 0,
		});
	});
});
