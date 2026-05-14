import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { NotificationPreferenceInput } from "@/http/repositories/notifications/notifications-repository-contract";

const reminderPreference: NotificationPreferenceInput = {
	type: "APPOINTMENT_REMINDER",
	pushEnabled: true,
	emailEnabled: false,
};

const mockPushNotificationsService = {
	getPreferences: mock(
		(_: string): Promise<NotificationPreferenceInput[]> =>
			Promise.resolve([reminderPreference]),
	),
};

mock.module("@/http/services/push-notifications.service", () => ({
	pushNotificationsService: mockPushNotificationsService,
}));

const { getNotificationPreferencesUseCase } = await import("./index");

describe("getNotificationPreferencesUseCase", () => {
	beforeEach(() => {
		mockPushNotificationsService.getPreferences.mockReset();
		mockPushNotificationsService.getPreferences.mockResolvedValue([
			reminderPreference,
		]);
	});

	test("returns resolved notification preferences", async () => {
		const result = await getNotificationPreferencesUseCase.execute("user-1");

		expect(mockPushNotificationsService.getPreferences).toHaveBeenCalledWith(
			"user-1",
		);
		expect(result.preferences).toEqual([reminderPreference]);
	});
});
