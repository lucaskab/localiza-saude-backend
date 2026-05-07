import type { FastifyReply, FastifyRequest } from "fastify";
import { getSchedulesByProfessionalUseCase } from "@/http/useCases/healthcare-provider-schedules/get-schedules-by-healthcare-provider-use-case";
import type { GetSchedulesByProviderParamsSchema } from "@/schemas/routes/healthcare-provider-schedules/get-schedules-by-healthcare-provider";

export const getSchedulesByProfessionalController = {
	async handle(
		request: FastifyRequest<{
			Params: GetSchedulesByProviderParamsSchema;
		}>,
		reply: FastifyReply,
	) {
		const { healthcareProviderId } = request.params;

		const result =
			await getSchedulesByProfessionalUseCase.execute(healthcareProviderId);

		return reply.status(200).send(result);
	},
};
