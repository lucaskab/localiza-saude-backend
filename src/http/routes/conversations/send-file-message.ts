import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { sendFileMessageController } from "@/http/controllers/conversations/send-file-message-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { sendFileMessageRouteOptions } from "@/schemas/routes/conversations/send-file-message";

const sendFileMessage = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/conversations/messages/file",
			sendFileMessageRouteOptions,
			sendFileMessageController.handle,
		);
};

export default sendFileMessage;
