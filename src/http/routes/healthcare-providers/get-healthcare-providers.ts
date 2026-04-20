import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getHealthcareProvidersController } from "@/http/controllers/healthcare-providers/get-healthcare-providers-controller";
import { getHealthcareProvidersRouteOptions } from "@/schemas/routes/healthcare-providers/get-healthcare-providers";
import { authMiddleware } from "@/http/middlewares/auth";

const getHealthcareProviders = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/healthcare-providers",
			getHealthcareProvidersRouteOptions,
			getHealthcareProvidersController.handle,
		);
};

export default getHealthcareProviders;
