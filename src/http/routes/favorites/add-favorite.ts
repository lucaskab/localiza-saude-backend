import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { addFavoriteController } from "@/http/controllers/favorites/add-favorite-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { addFavoriteRouteOptions } from "@/schemas/routes/favorites/add-favorite";

const addFavorite = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post("/favorites", addFavoriteRouteOptions, addFavoriteController.handle);
};

export default addFavorite;
