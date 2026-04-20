import type { FastifyReply, FastifyRequest } from "fastify";
import { getRatingsByProviderUseCase } from "@/http/useCases/ratings/get-ratings-by-provider-use-case";
import type { GetRatingsByProviderParamsSchema } from "@/schemas/routes/ratings/get-ratings-by-provider";

export const getRatingsByProviderController = {
	async handle(
		request: FastifyRequest<{ Params: GetRatingsByProviderParamsSchema }>,
		reply: FastifyReply,
	) {
		const { healthcareProviderId } = request.params;

		const result =
			await getRatingsByProviderUseCase.execute(healthcareProviderId);

		return reply.status(200).send(result);
	},
};
