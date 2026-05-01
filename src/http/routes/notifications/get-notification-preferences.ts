import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getNotificationPreferencesController } from "@/http/controllers/notifications/get-notification-preferences-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getNotificationPreferencesRouteOptions } from "@/schemas/routes/notifications/get-notification-preferences";

const getNotificationPreferences = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/notifications/preferences",
			getNotificationPreferencesRouteOptions,
			getNotificationPreferencesController.handle,
		);
};

export default getNotificationPreferences;
