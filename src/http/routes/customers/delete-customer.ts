import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteCustomerController } from "@/http/controllers/customers/delete-customer-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { deleteCustomerRouteOptions } from "@/schemas/routes/customers/delete-customer";

const deleteCustomer = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/customers/:id",
			deleteCustomerRouteOptions,
			deleteCustomerController.handle,
		);
};

export default deleteCustomer;
