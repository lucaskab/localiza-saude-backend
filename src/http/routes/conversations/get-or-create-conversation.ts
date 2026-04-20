import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getOrCreateConversationController } from "@/http/controllers/conversations/get-or-create-conversation-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getOrCreateConversationRouteOptions } from "@/schemas/routes/conversations/get-or-create-conversation";

const getOrCreateConversation = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/conversations",
			getOrCreateConversationRouteOptions,
			getOrCreateConversationController.handle,
		);
};

export default getOrCreateConversation;
