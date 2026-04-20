import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getAppointmentByIdController } from "@/http/controllers/appointments/get-appointment-by-id-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getAppointmentByIdRouteOptions } from "@/schemas/routes/appointments/get-appointment-by-id";

const getAppointmentById = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/appointments/:id",
			getAppointmentByIdRouteOptions,
			getAppointmentByIdController.handle,
		);
};

export default getAppointmentById;
