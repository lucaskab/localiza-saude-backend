import type { FastifyReply, FastifyRequest } from "fastify";
import { getDashboardUseCase } from "@/http/useCases/healthcare-providers/get-dashboard-use-case";
import type { GetDashboardParamsSchema } from "@/schemas/routes/healthcare-providers/get-dashboard";

export const getDashboardController = {
	async handle(
		request: FastifyRequest<{ Params: GetDashboardParamsSchema }>,
		reply: FastifyReply,
	) {
		const { healthcareProviderId } = request.params;

		const result = await getDashboardUseCase.execute(healthcareProviderId);

		return reply.status(200).send(result);
	},
};
