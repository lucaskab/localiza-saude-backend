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

const reminderPreference = (
	overrides: Partial<NotificationPreferenceInput> = {},
): NotificationPreferenceInput => ({
	type: "APPOINTMENT_REMINDER",
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
			__: "APPOINTMENT_REMINDER",
			___: "PUSH" | "EMAIL",
			____: string,
		): Promise<notification_delivery | null> => Promise.resolve(null),
		),
	createDelivery: mock(() => Promise.resolve(undefined)),
};

const mockPushNotificationsService = {
	getPreferences: mock(
		(_: string): Promise<NotificationPreferenceInput[]> =>
			Promise.resolve([reminderPreference()]),
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

const { sendDueAppointmentRemindersUseCase } = await import("./index");

describe("sendDueAppointmentRemindersUseCase", () => {
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
			reminderPreference(),
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
		const result = await sendDueAppointmentRemindersUseCase.execute(
			new Date("2026-08-19T10:00:00.000Z"),
		);

		expect(result).toEqual({
			processed: 0,
			sent: 0,
			skipped: 0,
			failed: 0,
		});
	});

	test("skips appointments without customer", async () => {
		mockNotificationsRepository.findUpcomingAppointmentsForReminderWindow.mockResolvedValue(
			[
				makeAppointment({
					id: "appointment-2",
					customer: null,
					customerId: null,
				}),
			],
		);

		const result = await sendDueAppointmentRemindersUseCase.execute(
			new Date("2026-08-19T10:00:00.000Z"),
		);

		expect(mockPushNotificationsService.sendToUser).not.toHaveBeenCalled();
		expect(result).toEqual({
			processed: 1,
			sent: 0,
			skipped: 1,
			failed: 0,
		});
	});

	test("sends push reminder when push is enabled", async () => {
		mockNotificationsRepository.findUpcomingAppointmentsForReminderWindow.mockResolvedValue(
			[makeAppointment()],
		);

		const result = await sendDueAppointmentRemindersUseCase.execute(
			new Date("2026-08-19T10:00:00.000Z"),
		);

		expect(mockPushNotificationsService.sendToUser).toHaveBeenCalledTimes(1);
		expect(mockEmailService.send).not.toHaveBeenCalled();
		expect(result).toEqual({
			processed: 1,
			sent: 1,
			skipped: 0,
			failed: 0,
		});
	});

	test("sends email reminder and records email delivery when email is enabled", async () => {
		mockNotificationsRepository.findUpcomingAppointmentsForReminderWindow.mockResolvedValue(
			[makeAppointment()],
		);
		mockPushNotificationsService.getPreferences.mockResolvedValue([
			reminderPreference({ pushEnabled: false, emailEnabled: true }),
		]);

		const result = await sendDueAppointmentRemindersUseCase.execute(
			new Date("2026-08-19T10:00:00.000Z"),
		);

		expect(mockEmailService.send).toHaveBeenCalledWith(
			expect.objectContaining({
				to: "lucas@example.com",
				subject: "Sua consulta começa em 1 hora",
				idempotencyKey: "appointment:appointment-1",
			}),
		);
		expect(mockNotificationsRepository.createDelivery).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: "customer-1",
				type: "APPOINTMENT_REMINDER",
				channel: "EMAIL",
				appointmentId: "appointment-1",
				dedupeKey: "appointment:appointment-1",
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

	test("respects disabled reminder preferences", async () => {
		mockNotificationsRepository.findUpcomingAppointmentsForReminderWindow.mockResolvedValue(
			[makeAppointment()],
		);
		mockPushNotificationsService.getPreferences.mockResolvedValue([
			reminderPreference({ pushEnabled: false, emailEnabled: false }),
		]);

		const result = await sendDueAppointmentRemindersUseCase.execute(
			new Date("2026-08-19T10:00:00.000Z"),
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

	test("does not resend channels that already have a recorded delivery", async () => {
		mockNotificationsRepository.findUpcomingAppointmentsForReminderWindow.mockResolvedValue(
			[makeAppointment()],
		);
		mockPushNotificationsService.getPreferences.mockResolvedValue([
			reminderPreference({ pushEnabled: true, emailEnabled: true }),
		]);
		mockNotificationsRepository.findDelivery.mockImplementation(
			(
				_: string,
				__: "APPOINTMENT_REMINDER",
				channel: "PUSH" | "EMAIL",
			) =>
				Promise.resolve(
					channel === "PUSH"
						? ({ id: "delivery-1" } as notification_delivery)
						: null,
				),
		);

		await sendDueAppointmentRemindersUseCase.execute(
			new Date("2026-08-19T10:00:00.000Z"),
		);

		expect(mockPushNotificationsService.sendToUser).not.toHaveBeenCalled();
		expect(mockEmailService.send).toHaveBeenCalledTimes(1);
	});

	test("counts failed push deliveries", async () => {
		mockNotificationsRepository.findUpcomingAppointmentsForReminderWindow.mockResolvedValue(
			[makeAppointment()],
		);
		mockPushNotificationsService.sendToUser.mockResolvedValue({
			status: "failed",
			errorMessage: "Expo request failed",
		});

		const result = await sendDueAppointmentRemindersUseCase.execute(
			new Date("2026-08-19T10:00:00.000Z"),
		);

		expect(result).toEqual({
			processed: 1,
			sent: 0,
			skipped: 0,
			failed: 1,
		});
	});

	test("counts failed email deliveries", async () => {
		mockNotificationsRepository.findUpcomingAppointmentsForReminderWindow.mockResolvedValue(
			[makeAppointment()],
		);
		mockPushNotificationsService.getPreferences.mockResolvedValue([
			reminderPreference({ pushEnabled: false, emailEnabled: true }),
		]);
		mockEmailService.send.mockResolvedValue({
			status: "failed",
			errorMessage: "Resend request failed",
		});

		const result = await sendDueAppointmentRemindersUseCase.execute(
			new Date("2026-08-19T10:00:00.000Z"),
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
});
