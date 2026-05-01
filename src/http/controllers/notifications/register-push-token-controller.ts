import type { FastifyReply, FastifyRequest } from "fastify";
import { registerPushTokenUseCase } from "@/http/useCases/notifications/register-push-token-use-case";
import type { RegisterPushTokenBodySchema } from "@/schemas/routes/notifications/register-push-token";

export const registerPushTokenController = {
	async handle(
		request: FastifyRequest<{ Body: RegisterPushTokenBodySchema }>,
		reply: FastifyReply,
	) {
		const userId = await request.getCurrentUserId();
		const result = await registerPushTokenUseCase.execute(userId, request.body);

		return reply.status(200).send(result);
	},
};
