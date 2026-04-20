import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteHealthcareProviderScheduleController } from "@/http/controllers/healthcare-provider-schedules/delete-healthcare-provider-schedule-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { deleteHealthcareProviderScheduleRouteOptions } from "@/schemas/routes/healthcare-provider-schedules/delete-healthcare-provider-schedule";

const deleteHealthcareProviderSchedule = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/healthcare-provider-schedules/:id",
			deleteHealthcareProviderScheduleRouteOptions,
			deleteHealthcareProviderScheduleController.handle,
		);
};

export default deleteHealthcareProviderSchedule;
