import { prismaNotificationsRepository } from "@/http/repositories/notifications/notifications-repository-implementation";
import { pushNotificationsService } from "@/http/services/push-notifications.service";
import type { UpdateNotificationPreferencesBodySchema } from "@/schemas/routes/notifications/update-notification-preferences";

export const updateNotificationPreferencesUseCase = {
	async execute(userId: string, data: UpdateNotificationPreferencesBodySchema) {
		await prismaNotificationsRepository.upsertPreferences(
			userId,
			data.preferences,
		);
		const preferences = await pushNotificationsService.getPreferences(userId);

		return { preferences };
	},
};
