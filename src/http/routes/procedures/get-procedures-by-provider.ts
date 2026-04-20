import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getProceduresByProviderController } from "@/http/controllers/procedures/get-procedures-by-provider-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getProceduresByProviderRouteOptions } from "@/schemas/routes/procedures/get-procedures-by-provider";

const getProceduresByProvider = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/healthcare-providers/:healthcareProviderId/procedures",
			getProceduresByProviderRouteOptions,
			getProceduresByProviderController.handle,
		);
};

export default getProceduresByProvider;
