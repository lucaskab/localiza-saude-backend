import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getCategoriesController } from "@/http/controllers/categories/get-categories-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getCategoriesRouteOptions } from "@/schemas/routes/categories/get-categories";

const getCategories = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/categories",
			getCategoriesRouteOptions,
			getCategoriesController.handle,
		);
};

export default getCategories;
