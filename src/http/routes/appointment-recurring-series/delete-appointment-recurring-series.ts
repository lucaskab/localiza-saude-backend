import type { FastifyInstance } from "fastify";
import { authMiddleware } from "@/http/middlewares/auth";
import { deleteAppointmentRecurringSeriesController } from "@/http/controllers/appointment-recurring-series/delete-appointment-recurring-series-controller";
import { deleteAppointmentRecurringSeriesRouteOptions } from "@/schemas/routes/appointment-recurring-series/delete-appointment-recurring-series";

const deleteAppointmentRecurringSeries = (app: FastifyInstance) => {
	app
		.register(authMiddleware)
		.delete(
			"/appointment-recurring-series/:id",
			deleteAppointmentRecurringSeriesRouteOptions,
			deleteAppointmentRecurringSeriesController.handle,
		);
};

export default deleteAppointmentRecurringSeries;
