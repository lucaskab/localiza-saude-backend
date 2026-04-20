import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteCategoryController } from "@/http/controllers/categories/delete-category-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { deleteCategoryRouteOptions } from "@/schemas/routes/categories/delete-category";

const deleteCategory = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/categories/:id",
			deleteCategoryRouteOptions,
			deleteCategoryController.handle,
		);
};

export default deleteCategory;
