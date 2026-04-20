import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getCategoryByIdController } from "@/http/controllers/categories/get-category-by-id-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getCategoryByIdRouteOptions } from "@/schemas/routes/categories/get-category-by-id";

const getCategoryById = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/categories/:id",
			getCategoryByIdRouteOptions,
			getCategoryByIdController.handle,
		);
};

export default getCategoryById;
