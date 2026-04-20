import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getConversationMessagesController } from "@/http/controllers/conversations/get-conversation-messages-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getConversationMessagesRouteOptions } from "@/schemas/routes/conversations/get-conversation-messages";

const getConversationMessages = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/conversations/:conversationId/messages",
			getConversationMessagesRouteOptions,
			getConversationMessagesController.handle,
		);
};

export default getConversationMessages;
