import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getAppointmentsController } from "@/http/controllers/appointments/get-appointments-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getAppointmentsRouteOptions } from "@/schemas/routes/appointments/get-appointments";

const getAppointments = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/appointments",
			getAppointmentsRouteOptions,
			getAppointmentsController.handle,
		);
};

export default getAppointments;
