import type { FastifyReply, FastifyRequest } from "fastify";
import { conversationPresenter } from "@/http/presenters/conversation-presenter";
import { getOrCreateConversationUseCase } from "@/http/useCases/conversations/get-or-create-conversation-use-case";
import type { GetOrCreateConversationBodySchema } from "@/schemas/routes/conversations/get-or-create-conversation";

export const getOrCreateConversationController = {
	async handle(
		request: FastifyRequest<{ Body: GetOrCreateConversationBodySchema }>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const { participantId } = request.body;

		// Map user role to userType
		const userType =
			user.role === "CUSTOMER" ? "CUSTOMER" : "HEALTHCARE_PROVIDER";

		const result = await getOrCreateConversationUseCase.execute({
			userId: user.id,
			userType,
			participantId,
		});

		return reply.status(200).send({
			conversation: conversationPresenter.toHTTP(result.conversation),
		});
	},
};
