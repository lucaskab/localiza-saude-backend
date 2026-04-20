import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getCustomerByUserIdController } from "@/http/controllers/customers/get-customer-by-user-id-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getCustomerByUserIdRouteOptions } from "@/schemas/routes/customers/get-customer-by-user-id";

const getCustomerByUserId = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/customers/user/:userId",
			getCustomerByUserIdRouteOptions,
			getCustomerByUserIdController.handle,
		);
};

export default getCustomerByUserId;
