import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateNotificationPreferencesController } from "@/http/controllers/notifications/update-notification-preferences-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { updateNotificationPreferencesRouteOptions } from "@/schemas/routes/notifications/update-notification-preferences";

const updateNotificationPreferences = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.put(
			"/notifications/preferences",
			updateNotificationPreferencesRouteOptions,
			updateNotificationPreferencesController.handle,
		);
};

export default updateNotificationPreferences;
