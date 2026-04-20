import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { sendTextMessageController } from "@/http/controllers/conversations/send-text-message-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { sendTextMessageRouteOptions } from "@/schemas/routes/conversations/send-text-message";

const sendTextMessage = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/conversations/messages/text",
			sendTextMessageRouteOptions,
			sendTextMessageController.handle,
		);
};

export default sendTextMessage;
