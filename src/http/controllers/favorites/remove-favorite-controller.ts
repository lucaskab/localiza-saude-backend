import type { FastifyReply, FastifyRequest } from "fastify";
import { removeFavoriteUseCase } from "@/http/useCases/favorites/remove-favorite-use-case";
import type { RemoveFavoriteParamsSchema } from "@/schemas/routes/favorites/remove-favorite";
import { getAuthenticatedCustomerId } from "./get-authenticated-customer-id";

export const removeFavoriteController = {
	async handle(
		request: FastifyRequest<{ Params: RemoveFavoriteParamsSchema }>,
		reply: FastifyReply,
	) {
		const customerId = await getAuthenticatedCustomerId(request);
		const result = await removeFavoriteUseCase.execute({
			customerId,
			healthcareProviderId: request.params.healthcareProviderId,
		});

		return reply.status(200).send(result);
	},
};
