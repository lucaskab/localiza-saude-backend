import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createAppointmentController } from "@/http/controllers/appointments/create-appointment-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { createAppointmentRouteOptions } from "@/schemas/routes/appointments/create-appointment";

const createAppointment = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/appointments",
			createAppointmentRouteOptions,
			createAppointmentController.handle,
		);
};

export default createAppointment;
