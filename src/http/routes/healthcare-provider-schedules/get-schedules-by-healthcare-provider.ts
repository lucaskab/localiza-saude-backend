import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getSchedulesByProfessionalController } from "@/http/controllers/healthcare-provider-schedules/get-schedules-by-healthcare-provider-controller";
import { getSchedulesByProfessionalRouteOptions } from "@/schemas/routes/healthcare-provider-schedules/get-schedules-by-healthcare-provider";

const getSchedulesByProfessional = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.get(
			"/healthcare-providers/:healthcareProviderId/schedules",
			getSchedulesByProfessionalRouteOptions,
			getSchedulesByProfessionalController.handle,
		);
};

export default getSchedulesByProfessional;
