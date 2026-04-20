import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getDashboardController } from "@/http/controllers/healthcare-providers/get-dashboard-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getDashboardRouteOptions } from "@/schemas/routes/healthcare-providers/get-dashboard";

const getDashboard = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/healthcare-providers/:healthcareProviderId/dashboard",
			getDashboardRouteOptions,
			getDashboardController.handle,
		);
};

export default getDashboard;
