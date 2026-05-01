import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { unregisterPushTokenController } from "@/http/controllers/notifications/unregister-push-token-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { unregisterPushTokenRouteOptions } from "@/schemas/routes/notifications/unregister-push-token";

const unregisterPushToken = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/notifications/push-tokens/unregister",
			unregisterPushTokenRouteOptions,
			unregisterPushTokenController.handle,
		);
};

export default unregisterPushToken;
