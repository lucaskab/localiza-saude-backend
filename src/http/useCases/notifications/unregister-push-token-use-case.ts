import { prismaNotificationsRepository } from "@/http/repositories/notifications/notifications-repository-implementation";
import type { UnregisterPushTokenBodySchema } from "@/schemas/routes/notifications/unregister-push-token";

export const unregisterPushTokenUseCase = {
	async execute(userId: string, data: UnregisterPushTokenBodySchema) {
		await prismaNotificationsRepository.deactivatePushToken(
			userId,
			data.token,
		);

		return { success: true };
	},
};
