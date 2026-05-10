import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createHealthcareProviderScheduleExceptionController } from "@/http/controllers/healthcare-provider-schedule-exceptions/create-healthcare-provider-schedule-exception-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { createHealthcareProviderScheduleExceptionRouteOptions } from "@/schemas/routes/healthcare-provider-schedule-exceptions/create-healthcare-provider-schedule-exception";

const createHealthcareProviderScheduleException = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/healthcare-provider-schedule-exceptions",
			createHealthcareProviderScheduleExceptionRouteOptions,
			createHealthcareProviderScheduleExceptionController.handle,
		);
};

export default createHealthcareProviderScheduleException;
