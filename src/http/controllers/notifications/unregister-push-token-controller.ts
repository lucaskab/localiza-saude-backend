import type { FastifyReply, FastifyRequest } from "fastify";
import { unregisterPushTokenUseCase } from "@/http/useCases/notifications/unregister-push-token-use-case";
import type { UnregisterPushTokenBodySchema } from "@/schemas/routes/notifications/unregister-push-token";

export const unregisterPushTokenController = {
	async handle(
		request: FastifyRequest<{ Body: UnregisterPushTokenBodySchema }>,
		reply: FastifyReply,
	) {
		const userId = await request.getCurrentUserId();
		const result = await unregisterPushTokenUseCase.execute(userId, request.body);

		return reply.status(200).send(result);
	},
};
