import type { FastifyReply, FastifyRequest } from "fastify";
import { getProviderRatingStatsUseCase } from "@/http/useCases/ratings/get-provider-rating-stats-use-case";
import type { GetProviderRatingStatsParamsSchema } from "@/schemas/routes/ratings/get-provider-rating-stats";

export const getProviderRatingStatsController = {
	async handle(
		request: FastifyRequest<{ Params: GetProviderRatingStatsParamsSchema }>,
		reply: FastifyReply,
	) {
		const { healthcareProviderId } = request.params;

		const result =
			await getProviderRatingStatsUseCase.execute(healthcareProviderId);

		return reply.status(200).send(result);
	},
};
