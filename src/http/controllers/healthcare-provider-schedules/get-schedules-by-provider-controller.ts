import type { FastifyReply, FastifyRequest } from "fastify";
import { getSchedulesByProviderUseCase } from "@/http/useCases/healthcare-provider-schedules/get-schedules-by-provider-use-case";
import type { GetSchedulesByProviderParamsSchema } from "@/schemas/routes/healthcare-provider-schedules/get-schedules-by-provider";

export const getSchedulesByProviderController = {
	async handle(
		request: FastifyRequest<{
			Params: GetSchedulesByProviderParamsSchema;
		}>,
		reply: FastifyReply,
	) {
		const { healthcareProviderId } = request.params;

		const result =
			await getSchedulesByProviderUseCase.execute(healthcareProviderId);

		return reply.status(200).send(result);
	},
};
