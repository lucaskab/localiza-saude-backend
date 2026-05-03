import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createSupportRequestController } from "@/http/controllers/settings/create-support-request-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { createSupportRequestRouteOptions } from "@/schemas/routes/settings/create-support-request";

const createSupportRequest = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/settings/requests",
			createSupportRequestRouteOptions,
			createSupportRequestController.handle,
		);
};

export default createSupportRequest;
