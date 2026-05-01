import type { FastifyReply, FastifyRequest } from "fastify";
import { getNotificationPreferencesUseCase } from "@/http/useCases/notifications/get-notification-preferences-use-case";

export const getNotificationPreferencesController = {
	async handle(request: FastifyRequest, reply: FastifyReply) {
		const userId = await request.getCurrentUserId();
		const result = await getNotificationPreferencesUseCase.execute(userId);

		return reply.status(200).send(result);
	},
};
