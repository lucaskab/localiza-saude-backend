import type { FastifyReply, FastifyRequest } from "fastify";
import { createRatingUseCase } from "@/http/useCases/ratings/create-rating-use-case";
import type { CreateRatingBodySchema } from "@/schemas/routes/ratings/create-rating";

export const createRatingController = {
	async handle(
		request: FastifyRequest<{ Body: CreateRatingBodySchema }>,
		reply: FastifyReply,
	) {
		const data = request.body;

		const result = await createRatingUseCase.execute(data);

		return reply.status(201).send(result);
	},
};
