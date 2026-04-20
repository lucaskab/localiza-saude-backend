import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createHealthcareProviderScheduleController } from "@/http/controllers/healthcare-provider-schedules/create-healthcare-provider-schedule-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { createHealthcareProviderScheduleRouteOptions } from "@/schemas/routes/healthcare-provider-schedules/create-healthcare-provider-schedule";

const createHealthcareProviderSchedule = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/healthcare-provider-schedules",
			createHealthcareProviderScheduleRouteOptions,
			createHealthcareProviderScheduleController.handle,
		);
};

export default createHealthcareProviderSchedule;
