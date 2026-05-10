import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteHealthcareProviderScheduleExceptionController } from "@/http/controllers/healthcare-provider-schedule-exceptions/delete-healthcare-provider-schedule-exception-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { deleteHealthcareProviderScheduleExceptionRouteOptions } from "@/schemas/routes/healthcare-provider-schedule-exceptions/delete-healthcare-provider-schedule-exception";

const deleteHealthcareProviderScheduleException = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/healthcare-provider-schedule-exceptions/:id",
			deleteHealthcareProviderScheduleExceptionRouteOptions,
			deleteHealthcareProviderScheduleExceptionController.handle,
		);
};

export default deleteHealthcareProviderScheduleException;
