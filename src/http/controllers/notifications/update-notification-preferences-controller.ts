import type { FastifyReply, FastifyRequest } from "fastify";
import { updateNotificationPreferencesUseCase } from "@/http/useCases/notifications/update-notification-preferences-use-case";
import type { UpdateNotificationPreferencesBodySchema } from "@/schemas/routes/notifications/update-notification-preferences";

export const updateNotificationPreferencesController = {
	async handle(
		request: FastifyRequest<{ Body: UpdateNotificationPreferencesBodySchema }>,
		reply: FastifyReply,
	) {
		const userId = await request.getCurrentUserId();
		const result = await updateNotificationPreferencesUseCase.execute(
			userId,
			request.body,
		);

		return reply.status(200).send(result);
	},
};
