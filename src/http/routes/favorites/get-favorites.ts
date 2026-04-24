import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getFavoritesController } from "@/http/controllers/favorites/get-favorites-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getFavoritesRouteOptions } from "@/schemas/routes/favorites/get-favorites";

const getFavorites = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get("/favorites", getFavoritesRouteOptions, getFavoritesController.handle);
};

export default getFavorites;
