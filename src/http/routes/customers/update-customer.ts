import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateCustomerController } from "@/http/controllers/customers/update-customer-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { updateCustomerRouteOptions } from "@/schemas/routes/customers/update-customer";

const updateCustomer = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.put(
			"/customers/:id",
			updateCustomerRouteOptions,
			updateCustomerController.handle,
		);
};

export default updateCustomer;
