import type { FastifyReply, FastifyRequest } from "fastify";
import { addFavoriteUseCase } from "@/http/useCases/favorites/add-favorite-use-case";
import type { AddFavoriteBodySchema } from "@/schemas/routes/favorites/add-favorite";
import { getAuthenticatedCustomerId } from "./get-authenticated-customer-id";

export const addFavoriteController = {
	async handle(
		request: FastifyRequest<{ Body: AddFavoriteBodySchema }>,
		reply: FastifyReply,
	) {
		const customerId = await getAuthenticatedCustomerId(request);
		const result = await addFavoriteUseCase.execute({
			customerId,
			healthcareProviderId: request.body.healthcareProviderId,
		});

		return reply.status(201).send(result);
	},
};
