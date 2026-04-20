import type { FastifyReply, FastifyRequest } from "fastify";
import {
	conversationPresenter,
	messagePresenter,
} from "@/http/presenters/conversation-presenter";
import { getConversationMessagesUseCase } from "@/http/useCases/conversations/get-conversation-messages-use-case";
import type {
	GetConversationMessagesParamsSchema,
	GetConversationMessagesQuerySchema,
} from "@/schemas/routes/conversations/get-conversation-messages";

export const getConversationMessagesController = {
	async handle(
		request: FastifyRequest<{
			Params: GetConversationMessagesParamsSchema;
			Querystring: GetConversationMessagesQuerySchema;
		}>,
		reply: FastifyReply,
	) {
		const { conversationId } = request.params;
		const { limit, offset, relatedAppointmentId } = request.query;

		// Verify user is authenticated
		await request.getCurrentUserId();

		const result = await getConversationMessagesUseCase.execute({
			conversationId,
			limit,
			offset,
			relatedAppointmentId,
		});

		return reply.status(200).send({
			messages: messagePresenter.toHTTPMany(result.messages),
			conversation: conversationPresenter.toHTTP(result.conversation),
		});
	},
};
