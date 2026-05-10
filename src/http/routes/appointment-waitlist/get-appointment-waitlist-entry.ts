import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getAppointmentWaitlistEntryController } from "@/http/controllers/appointment-waitlist/get-appointment-waitlist-entry-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getAppointmentWaitlistEntryRouteOptions } from "@/schemas/routes/appointment-waitlist/get-appointment-waitlist-entry";

const getAppointmentWaitlistEntry = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/appointment-waitlist",
			getAppointmentWaitlistEntryRouteOptions,
			getAppointmentWaitlistEntryController.handle,
		);
};

export default getAppointmentWaitlistEntry;
