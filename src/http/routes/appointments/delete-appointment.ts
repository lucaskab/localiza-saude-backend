import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteAppointmentController } from "@/http/controllers/appointments/delete-appointment-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { deleteAppointmentRouteOptions } from "@/schemas/routes/appointments/delete-appointment";

const deleteAppointment = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/appointments/:id",
			deleteAppointmentRouteOptions,
			deleteAppointmentController.handle,
		);
};

export default deleteAppointment;
