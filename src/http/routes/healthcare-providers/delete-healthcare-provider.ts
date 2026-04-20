import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteHealthcareProviderController } from "@/http/controllers/healthcare-providers/delete-healthcare-provider-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { deleteHealthcareProviderRouteOptions } from "@/schemas/routes/healthcare-providers/delete-healthcare-provider";

const deleteHealthcareProvider = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/healthcare-providers/:id",
			deleteHealthcareProviderRouteOptions,
			deleteHealthcareProviderController.handle,
		);
};

export default deleteHealthcareProvider;
