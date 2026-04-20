import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateCategoryController } from "@/http/controllers/categories/update-category-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { updateCategoryRouteOptions } from "@/schemas/routes/categories/update-category";

const updateCategory = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.put(
			"/categories/:id",
			updateCategoryRouteOptions,
			updateCategoryController.handle,
		);
};

export default updateCategory;
