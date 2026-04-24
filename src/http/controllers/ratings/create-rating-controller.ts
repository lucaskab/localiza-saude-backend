import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/database/prisma";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { createRatingUseCase } from "@/http/useCases/ratings/create-rating-use-case";
import type { CreateRatingBodySchema } from "@/schemas/routes/ratings/create-rating";

export const createRatingController = {
	async handle(
		request: FastifyRequest<{ Body: CreateRatingBodySchema }>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const customer = await prisma.customer.findUnique({
			where: { userId: user.id },
		});

		if (!customer) {
			throw new BadRequestError("User is not registered as a customer");
		}
		const data = request.body;

		const result = await createRatingUseCase.execute({
			...data,
			customerId: customer.id,
		});

		return reply.status(201).send(result);
	},
};
