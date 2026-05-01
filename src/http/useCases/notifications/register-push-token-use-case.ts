import { prismaNotificationsRepository } from "@/http/repositories/notifications/notifications-repository-implementation";
import type { RegisterPushTokenBodySchema } from "@/schemas/routes/notifications/register-push-token";

export const registerPushTokenUseCase = {
	async execute(userId: string, data: RegisterPushTokenBodySchema) {
		const pushToken = await prismaNotificationsRepository.upsertPushToken({
			userId,
			token: data.token,
			platform: data.platform,
			deviceId: data.deviceId,
		});

		return {
			pushToken: {
				id: pushToken.id,
				token: pushToken.token,
				platform: pushToken.platform,
				isActive: pushToken.isActive,
			},
		};
	},
};
