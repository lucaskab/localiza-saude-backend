import type { FastifyReply, FastifyRequest } from "fastify";
import { getMessageFileUrlUseCase } from "@/http/useCases/conversations/get-message-file-url-use-case";
import type { GetMessageFileUrlParamsSchema } from "@/schemas/routes/conversations/get-message-file-url";

export const getMessageFileUrlController = {
	async handle(
		request: FastifyRequest<{
			Params: GetMessageFileUrlParamsSchema;
		}>,
		reply: FastifyReply,
	) {
		const currentUserId = await request.getCurrentUserId();
		const result = await getMessageFileUrlUseCase.execute({
			messageId: request.params.messageId,
			currentUserId,
		});

		return reply.status(200).send(result);
	},
};
