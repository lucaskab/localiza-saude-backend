import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createRatingController } from "@/http/controllers/ratings/create-rating-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { createRatingRouteOptions } from "@/schemas/routes/ratings/create-rating";

const createRating = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post("/ratings", createRatingRouteOptions, createRatingController.handle);
};

export default createRating;
