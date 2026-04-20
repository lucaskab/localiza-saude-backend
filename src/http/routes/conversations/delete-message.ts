import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteMessageController } from "@/http/controllers/conversations/delete-message-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { deleteMessageRouteOptions } from "@/schemas/routes/conversations/delete-message";

const deleteMessage = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/conversations/messages/:messageId",
			deleteMessageRouteOptions,
			deleteMessageController.handle,
		);
};

export default deleteMessage;
