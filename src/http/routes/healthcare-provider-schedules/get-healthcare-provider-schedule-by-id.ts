import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getHealthcareProviderScheduleByIdController } from "@/http/controllers/healthcare-provider-schedules/get-healthcare-provider-schedule-by-id-controller";
import { getHealthcareProviderScheduleByIdRouteOptions } from "@/schemas/routes/healthcare-provider-schedules/get-healthcare-provider-schedule-by-id";

const getHealthcareProviderScheduleById = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.get(
			"/healthcare-provider-schedules/:id",
			getHealthcareProviderScheduleByIdRouteOptions,
			getHealthcareProviderScheduleByIdController.handle,
		);
};

export default getHealthcareProviderScheduleById;
