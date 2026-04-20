import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateHealthcareProviderScheduleController } from "@/http/controllers/healthcare-provider-schedules/update-healthcare-provider-schedule-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { updateHealthcareProviderScheduleRouteOptions } from "@/schemas/routes/healthcare-provider-schedules/update-healthcare-provider-schedule";

const updateHealthcareProviderSchedule = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.patch(
			"/healthcare-provider-schedules/:id",
			updateHealthcareProviderScheduleRouteOptions,
			updateHealthcareProviderScheduleController.handle,
		);
};

export default updateHealthcareProviderSchedule;
