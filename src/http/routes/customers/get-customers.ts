import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getCustomersController } from "@/http/controllers/customers/get-customers-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getCustomersRouteOptions } from "@/schemas/routes/customers/get-customers";

const getCustomers = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get("/customers", getCustomersRouteOptions, getCustomersController.handle);
};

export default getCustomers;
