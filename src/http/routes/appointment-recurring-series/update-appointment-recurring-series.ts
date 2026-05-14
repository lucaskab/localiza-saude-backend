import type { FastifyInstance } from "fastify";
import { authMiddleware } from "@/http/middlewares/auth";
import { updateAppointmentRecurringSeriesController } from "@/http/controllers/appointment-recurring-series/update-appointment-recurring-series-controller";
import { updateAppointmentRecurringSeriesRouteOptions } from "@/schemas/routes/appointment-recurring-series/update-appointment-recurring-series";

const updateAppointmentRecurringSeries = (app: FastifyInstance) => {
	app
		.register(authMiddleware)
		.patch(
			"/appointment-recurring-series/:id",
			updateAppointmentRecurringSeriesRouteOptions,
			updateAppointmentRecurringSeriesController.handle,
		);
};

export default updateAppointmentRecurringSeries;
