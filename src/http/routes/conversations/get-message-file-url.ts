import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getMessageFileUrlController } from "@/http/controllers/conversations/get-message-file-url-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getMessageFileUrlRouteOptions } from "@/schemas/routes/conversations/get-message-file-url";

const getMessageFileUrl = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/conversations/messages/:messageId/file-url",
			getMessageFileUrlRouteOptions,
			getMessageFileUrlController.handle,
		);
};

export default getMessageFileUrl;
