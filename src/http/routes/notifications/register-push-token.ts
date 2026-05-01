import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { registerPushTokenController } from "@/http/controllers/notifications/register-push-token-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { registerPushTokenRouteOptions } from "@/schemas/routes/notifications/register-push-token";

const registerPushToken = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/notifications/push-tokens",
			registerPushTokenRouteOptions,
			registerPushTokenController.handle,
		);
};

export default registerPushToken;
