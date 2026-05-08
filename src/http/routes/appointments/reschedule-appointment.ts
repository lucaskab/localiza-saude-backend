import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { rescheduleAppointmentController } from "@/http/controllers/appointments/reschedule-appointment-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import {
	rescheduleAppointmentRouteOptions,
	respondToRescheduleRequestRouteOptions,
} from "@/schemas/routes/appointments/reschedule-appointment";

const rescheduleAppointment = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/appointments/:id/reschedule",
			rescheduleAppointmentRouteOptions,
			rescheduleAppointmentController.request,
		)
		.patch(
			"/appointments/:id/reschedule-requests/:requestId",
			respondToRescheduleRequestRouteOptions,
			rescheduleAppointmentController.respond,
		);
};

export default rescheduleAppointment;
