import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createCustomerController } from "@/http/controllers/customers/create-customer-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { createCustomerRouteOptions } from "@/schemas/routes/customers/create-customer";

const createCustomer = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/customers",
			createCustomerRouteOptions,
			createCustomerController.handle,
		);
};

export default createCustomer;
