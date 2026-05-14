import { pushNotificationsService } from "@/http/services/push-notifications.service";

export const getNotificationPreferencesUseCase = {
	async execute(userId: string) {
		const preferences = await pushNotificationsService.getPreferences(userId);

		return { preferences };
	},
};
