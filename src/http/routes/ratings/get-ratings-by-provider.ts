import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getRatingsByProviderController } from "@/http/controllers/ratings/get-ratings-by-provider-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getRatingsByProviderRouteOptions } from "@/schemas/routes/ratings/get-ratings-by-provider";

const getRatingsByProvider = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/healthcare-providers/:healthcareProviderId/ratings",
			getRatingsByProviderRouteOptions,
			getRatingsByProviderController.handle,
		);
};

export default getRatingsByProvider;
