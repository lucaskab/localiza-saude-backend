import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { removeFavoriteController } from "@/http/controllers/favorites/remove-favorite-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { removeFavoriteRouteOptions } from "@/schemas/routes/favorites/remove-favorite";

const removeFavorite = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/favorites/:healthcareProviderId",
			removeFavoriteRouteOptions,
			removeFavoriteController.handle,
		);
};

export default removeFavorite;
