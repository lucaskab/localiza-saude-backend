import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getProviderRatingStatsController } from "@/http/controllers/ratings/get-provider-rating-stats-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getProviderRatingStatsRouteOptions } from "@/schemas/routes/ratings/get-provider-rating-stats";

const getProviderRatingStats = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/healthcare-providers/:healthcareProviderId/rating-stats",
			getProviderRatingStatsRouteOptions,
			getProviderRatingStatsController.handle,
		);
};

export default getProviderRatingStats;
