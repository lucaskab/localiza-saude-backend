import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { NotificationPreferenceInput } from "@/http/repositories/notifications/notifications-repository-contract";
import type { UpdateNotificationPreferencesBodySchema } from "@/schemas/routes/notifications/update-notification-preferences";

const reminderPreference: UpdateNotificationPreferencesBodySchema["preferences"][number] = {
	type: "APPOINTMENT_REMINDER",
	pushEnabled: true,
	emailEnabled: false,
};

const resolvedReminderPreference: NotificationPreferenceInput = {
	type: "APPOINTMENT_REMINDER",
	pushEnabled: true,
	emailEnabled: false,
};

const mockNotificationsRepository = {
	upsertPreferences: mock(
		(
			_: string,
			preferences: UpdateNotificationPreferencesBodySchema["preferences"],
		) =>
			Promise.resolve(
				preferences.map((preference) => ({
					...preference,
					id: `pref-${preference.type}`,
					userId: "user-1",
					createdAt: new Date(),
					updatedAt: new Date(),
				})),
			),
	),
};

const mockPushNotificationsService = {
	getPreferences: mock(
		(_: string): Promise<NotificationPreferenceInput[]> =>
			Promise.resolve([resolvedReminderPreference]),
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

const { updateNotificationPreferencesUseCase } = await import("./index");

describe("updateNotificationPreferencesUseCase", () => {
	beforeEach(() => {
		mockNotificationsRepository.upsertPreferences.mockReset();
		mockPushNotificationsService.getPreferences.mockReset();
		mockNotificationsRepository.upsertPreferences.mockImplementation(
			(
				_: string,
				preferences: UpdateNotificationPreferencesBodySchema["preferences"],
			) =>
				Promise.resolve(
					preferences.map((preference) => ({
						...preference,
						id: `pref-${preference.type}`,
						userId: "user-1",
						createdAt: new Date(),
						updatedAt: new Date(),
					})),
				),
		);
		mockPushNotificationsService.getPreferences.mockResolvedValue([
			resolvedReminderPreference,
		]);
	});

	test("persists preferences and returns resolved channel preferences", async () => {
		const data: UpdateNotificationPreferencesBodySchema = {
			preferences: [reminderPreference],
		};

		const result = await updateNotificationPreferencesUseCase.execute(
			"user-1",
			data,
		);

		expect(mockNotificationsRepository.upsertPreferences).toHaveBeenCalledWith(
			"user-1",
			[reminderPreference],
		);
		expect(mockPushNotificationsService.getPreferences).toHaveBeenCalledWith(
			"user-1",
		);
		expect(result.preferences).toEqual([resolvedReminderPreference]);
	});
});
