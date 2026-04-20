import type { FastifyReply, FastifyRequest } from "fastify";
import { getHealthcareProviderScheduleByIdUseCase } from "@/http/useCases/healthcare-provider-schedules/get-healthcare-provider-schedule-by-id-use-case";
import type { GetHealthcareProviderScheduleByIdParamsSchema } from "@/schemas/routes/healthcare-provider-schedules/get-healthcare-provider-schedule-by-id";

export const getHealthcareProviderScheduleByIdController = {
	async handle(
		request: FastifyRequest<{
			Params: GetHealthcareProviderScheduleByIdParamsSchema;
		}>,
		reply: FastifyReply,
	) {
		const { id } = request.params;

		const result = await getHealthcareProviderScheduleByIdUseCase.execute(id);

		return reply.status(200).send(result);
	},
};
