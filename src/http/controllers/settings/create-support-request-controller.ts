import type { FastifyReply, FastifyRequest } from "fastify";
import { createSupportRequestUseCase } from "@/http/useCases/settings/create-support-request-use-case";
import type { CreateSupportRequestBodySchema } from "@/schemas/routes/settings/create-support-request";

export const createSupportRequestController = {
	async handle(
		request: FastifyRequest<{ Body: CreateSupportRequestBodySchema }>,
		reply: FastifyReply,
	) {
		const userId = await request.getCurrentUserId();
		const result = await createSupportRequestUseCase.execute(
			userId,
			request.body,
		);

		return reply.status(201).send(result);
	},
};
