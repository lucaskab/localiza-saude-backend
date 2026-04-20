import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateRatingController } from "@/http/controllers/ratings/update-rating-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { updateRatingRouteOptions } from "@/schemas/routes/ratings/update-rating";

const updateRating = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.put(
			"/ratings/:id",
			updateRatingRouteOptions,
			updateRatingController.handle,
		);
};

export default updateRating;
