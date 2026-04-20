import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getHealthcareProviderByIdController } from "@/http/controllers/healthcare-providers/get-healthcare-provider-by-id-controller";
import { getHealthcareProviderByIdRouteOptions } from "@/schemas/routes/healthcare-providers/get-healthcare-provider-by-id";
import { authMiddleware } from "@/http/middlewares/auth";

const getHealthcareProviderById = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/healthcare-providers/:id",
			getHealthcareProviderByIdRouteOptions,
			getHealthcareProviderByIdController.handle,
		);
};

export default getHealthcareProviderById;
