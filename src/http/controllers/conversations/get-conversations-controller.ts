import type { FastifyReply, FastifyRequest } from "fastify";
import { conversationPresenter } from "@/http/presenters/conversation-presenter";
import { getConversationsUseCase } from "@/http/useCases/conversations/get-conversations-use-case";
import type { GetConversationsQuerySchema } from "@/schemas/routes/conversations/get-conversations";

export const getConversationsController = {
	async handle(
		request: FastifyRequest<{
			Querystring: GetConversationsQuerySchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const { limit, offset } = request.query;

		// Map user role to userType
		const userType =
			user.role === "CUSTOMER" ? "CUSTOMER" : "HEALTHCARE_PROVIDER";

		const result = await getConversationsUseCase.execute({
			userId: user.id,
			userType,
			limit,
			offset,
		});

		return reply.status(200).send({
			conversations: conversationPresenter.toHTTPMany(result.conversations),
		});
	},
};
