import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateHealthcareProviderScheduleExceptionController } from "@/http/controllers/healthcare-provider-schedule-exceptions/update-healthcare-provider-schedule-exception-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { updateHealthcareProviderScheduleExceptionRouteOptions } from "@/schemas/routes/healthcare-provider-schedule-exceptions/update-healthcare-provider-schedule-exception";

const updateHealthcareProviderScheduleException = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.patch(
			"/healthcare-provider-schedule-exceptions/:id",
			updateHealthcareProviderScheduleExceptionRouteOptions,
			updateHealthcareProviderScheduleExceptionController.handle,
		);
};

export default updateHealthcareProviderScheduleException;
