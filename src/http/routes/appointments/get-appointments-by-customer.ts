import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getAppointmentsByCustomerController } from "@/http/controllers/appointments/get-appointments-by-customer-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getAppointmentsByCustomerRouteOptions } from "@/schemas/routes/appointments/get-appointments-by-customer";

const getAppointmentsByCustomer = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/customers/:customerId/appointments",
			getAppointmentsByCustomerRouteOptions,
			getAppointmentsByCustomerController.handle,
		);
};

export default getAppointmentsByCustomer;
