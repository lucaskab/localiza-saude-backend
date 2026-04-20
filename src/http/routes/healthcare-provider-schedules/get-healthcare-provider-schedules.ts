import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getHealthcareProviderSchedulesController } from "@/http/controllers/healthcare-provider-schedules/get-healthcare-provider-schedules-controller";
import { getHealthcareProviderSchedulesRouteOptions } from "@/schemas/routes/healthcare-provider-schedules/get-healthcare-provider-schedules";

const getHealthcareProviderSchedules = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.get(
			"/healthcare-provider-schedules",
			getHealthcareProviderSchedulesRouteOptions,
			getHealthcareProviderSchedulesController.handle,
		);
};

export default getHealthcareProviderSchedules;
