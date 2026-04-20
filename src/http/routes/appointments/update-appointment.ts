import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateAppointmentController } from "@/http/controllers/appointments/update-appointment-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { updateAppointmentRouteOptions } from "@/schemas/routes/appointments/update-appointment";

const updateAppointment = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.patch(
			"/appointments/:id",
			updateAppointmentRouteOptions,
			updateAppointmentController.handle,
		);
};

export default updateAppointment;
