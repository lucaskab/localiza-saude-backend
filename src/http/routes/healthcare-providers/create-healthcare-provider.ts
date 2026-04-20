import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createHealthcareProviderController } from "@/http/controllers/healthcare-providers/create-healthcare-provider-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { createHealthcareProviderRouteOptions } from "@/schemas/routes/healthcare-providers/create-healthcare-provider";

const createHealthcareProvider = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/healthcare-providers",
			createHealthcareProviderRouteOptions,
			createHealthcareProviderController.handle,
		);
};

export default createHealthcareProvider;
