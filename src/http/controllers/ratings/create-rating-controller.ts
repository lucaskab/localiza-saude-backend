import type { FastifyReply, FastifyRequest } from "fastify";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { createRatingUseCase } from "@/http/useCases/ratings/create-rating-use-case";
import type { CreateRatingBodySchema } from "@/schemas/routes/ratings/create-rating";

export const createRatingController = {
	async handle(
		request: FastifyRequest<{ Body: CreateRatingBodySchema }>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();

		if (user.role !== "CUSTOMER") {
			throw new BadRequestError("User role must be CUSTOMER to rate");
		}
		const data = request.body;

		const result = await createRatingUseCase.execute({
			...data,
			customerId: user.id,
		});

		return reply.status(201).send(result);
	},
};
