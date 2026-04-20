import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getHealthcareProviderByUserIdController } from "@/http/controllers/healthcare-providers/get-healthcare-provider-by-user-id-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getHealthcareProviderByUserIdRouteOptions } from "@/schemas/routes/healthcare-providers/get-healthcare-provider-by-user-id";

const getHealthcareProviderByUserId = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/healthcare-providers/user/:userId",
			getHealthcareProviderByUserIdRouteOptions,
			getHealthcareProviderByUserIdController.handle,
		);
};

export default getHealthcareProviderByUserId;
