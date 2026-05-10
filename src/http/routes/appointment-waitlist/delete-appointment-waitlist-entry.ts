import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteAppointmentWaitlistEntryController } from "@/http/controllers/appointment-waitlist/delete-appointment-waitlist-entry-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { deleteAppointmentWaitlistEntryRouteOptions } from "@/schemas/routes/appointment-waitlist/delete-appointment-waitlist-entry";

const deleteAppointmentWaitlistEntry = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/appointment-waitlist/:id",
			deleteAppointmentWaitlistEntryRouteOptions,
			deleteAppointmentWaitlistEntryController.handle,
		);
};

export default deleteAppointmentWaitlistEntry;
