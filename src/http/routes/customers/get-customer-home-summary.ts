import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getCustomerHomeSummaryController } from "@/http/controllers/customers/get-customer-home-summary-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getCustomerHomeSummaryRouteOptions } from "@/schemas/routes/customers/get-customer-home-summary";

const getCustomerHomeSummary = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/customers/me/home-summary",
			getCustomerHomeSummaryRouteOptions,
			getCustomerHomeSummaryController.handle,
		);
};

export default getCustomerHomeSummary;
