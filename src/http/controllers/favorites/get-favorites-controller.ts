import type { FastifyReply, FastifyRequest } from "fastify";
import { getFavoritesUseCase } from "@/http/useCases/favorites/get-favorites-use-case";
import { getAuthenticatedCustomerId } from "./get-authenticated-customer-id";

export const getFavoritesController = {
	async handle(request: FastifyRequest, reply: FastifyReply) {
		const customerId = await getAuthenticatedCustomerId(request);
		const result = await getFavoritesUseCase.execute(customerId);

		return reply.status(200).send(result);
	},
};
