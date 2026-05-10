import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getScheduleExceptionsByHealthcareProviderController } from "@/http/controllers/healthcare-provider-schedule-exceptions/get-schedule-exceptions-by-healthcare-provider-controller";
import { getScheduleExceptionsByHealthcareProviderRouteOptions } from "@/schemas/routes/healthcare-provider-schedule-exceptions/get-schedule-exceptions-by-healthcare-provider";

const getScheduleExceptionsByHealthcareProvider = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.get(
			"/healthcare-providers/:healthcareProviderId/schedule-exceptions",
			getScheduleExceptionsByHealthcareProviderRouteOptions,
			getScheduleExceptionsByHealthcareProviderController.handle,
		);
};

export default getScheduleExceptionsByHealthcareProvider;
