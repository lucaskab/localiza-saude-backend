import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getSchedulesByProviderController } from "@/http/controllers/healthcare-provider-schedules/get-schedules-by-provider-controller";
import { getSchedulesByProviderRouteOptions } from "@/schemas/routes/healthcare-provider-schedules/get-schedules-by-provider";

const getSchedulesByProvider = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.get(
			"/healthcare-providers/:healthcareProviderId/schedules",
			getSchedulesByProviderRouteOptions,
			getSchedulesByProviderController.handle,
		);
};

export default getSchedulesByProvider;
