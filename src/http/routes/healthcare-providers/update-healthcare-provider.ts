import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateHealthcareProviderController } from "@/http/controllers/healthcare-providers/update-healthcare-provider-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { updateHealthcareProviderRouteOptions } from "@/schemas/routes/healthcare-providers/update-healthcare-provider";

const updateHealthcareProvider = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.patch(
			"/healthcare-providers/:id",
			updateHealthcareProviderRouteOptions,
			updateHealthcareProviderController.handle,
		);
};

export default updateHealthcareProvider;
