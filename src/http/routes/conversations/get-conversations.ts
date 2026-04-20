import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getConversationsController } from "@/http/controllers/conversations/get-conversations-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getConversationsRouteOptions } from "@/schemas/routes/conversations/get-conversations";

const getConversations = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/conversations",
			getConversationsRouteOptions,
			getConversationsController.handle,
		);
};

export default getConversations;
