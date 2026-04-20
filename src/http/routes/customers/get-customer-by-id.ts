import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getCustomerByIdController } from "@/http/controllers/customers/get-customer-by-id-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getCustomerByIdRouteOptions } from "@/schemas/routes/customers/get-customer-by-id";

const getCustomerById = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/customers/:id",
			getCustomerByIdRouteOptions,
			getCustomerByIdController.handle,
		);
};

export default getCustomerById;
