import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteMessageUseCase } from "@/http/useCases/conversations/delete-message-use-case";
import type { DeleteMessageParamsSchema } from "@/schemas/routes/conversations/delete-message";

export const deleteMessageController = {
	async handle(
		request: FastifyRequest<{ Params: DeleteMessageParamsSchema }>,
		reply: FastifyReply,
	) {
		const { messageId } = request.params;

		const currentUserId = await request.getCurrentUserId();

		const result = await deleteMessageUseCase.execute({
			messageId,
			currentUserId,
		});

		return reply.status(200).send(result);
	},
};
