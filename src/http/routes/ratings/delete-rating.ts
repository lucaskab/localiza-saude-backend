import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteRatingController } from "@/http/controllers/ratings/delete-rating-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { deleteRatingRouteOptions } from "@/schemas/routes/ratings/delete-rating";

const deleteRating = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/ratings/:id",
			deleteRatingRouteOptions,
			deleteRatingController.handle,
		);
};

export default deleteRating;
