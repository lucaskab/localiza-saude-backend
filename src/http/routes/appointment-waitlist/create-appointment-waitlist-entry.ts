import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createAppointmentWaitlistEntryController } from "@/http/controllers/appointment-waitlist/create-appointment-waitlist-entry-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { createAppointmentWaitlistEntryRouteOptions } from "@/schemas/routes/appointment-waitlist/create-appointment-waitlist-entry";

const createAppointmentWaitlistEntry = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/appointment-waitlist",
			createAppointmentWaitlistEntryRouteOptions,
			createAppointmentWaitlistEntryController.handle,
		);
};

export default createAppointmentWaitlistEntry;
