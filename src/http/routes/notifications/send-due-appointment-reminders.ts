import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { sendDueAppointmentRemindersController } from "@/http/controllers/notifications/send-due-appointment-reminders-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { sendDueAppointmentRemindersRouteOptions } from "@/schemas/routes/notifications/send-due-appointment-reminders";

const sendDueAppointmentReminders = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/notifications/appointment-reminders/send-due",
			sendDueAppointmentRemindersRouteOptions,
			sendDueAppointmentRemindersController.handle,
		);
};

export default sendDueAppointmentReminders;
