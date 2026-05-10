import type { FastifyReply, FastifyRequest } from "fastify";
import { getScheduleExceptionsByHealthcareProviderUseCase } from "@/http/useCases/healthcare-provider-schedule-exceptions/get-schedule-exceptions-by-healthcare-provider-use-case";
import type {
	GetScheduleExceptionsByHealthcareProviderParamsSchema,
	GetScheduleExceptionsByHealthcareProviderQuerySchema,
} from "@/schemas/routes/healthcare-provider-schedule-exceptions/get-schedule-exceptions-by-healthcare-provider";

export const getScheduleExceptionsByHealthcareProviderController = {
	async handle(
		request: FastifyRequest<{
			Params: GetScheduleExceptionsByHealthcareProviderParamsSchema;
			Querystring: GetScheduleExceptionsByHealthcareProviderQuerySchema;
		}>,
		reply: FastifyReply,
	) {
		const { healthcareProviderId } = request.params;
		const { from, to } = request.query;

		const result =
			await getScheduleExceptionsByHealthcareProviderUseCase.execute({
				healthcareProviderId,
				from,
				to,
			});

		return reply.status(200).send(result);
	},
};
