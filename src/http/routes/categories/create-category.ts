import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createCategoryController } from "@/http/controllers/categories/create-category-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { createCategoryRouteOptions } from "@/schemas/routes/categories/create-category";

const createCategory = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/categories",
			createCategoryRouteOptions,
			createCategoryController.handle,
		);
};

export default createCategory;
