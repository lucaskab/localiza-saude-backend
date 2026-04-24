import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/database/prisma";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { deleteRatingUseCase } from "@/http/useCases/ratings/delete-rating-use-case";
import type { DeleteRatingParamsSchema } from "@/schemas/routes/ratings/delete-rating";

export const deleteRatingController = {
	async handle(
		request: FastifyRequest<{ Params: DeleteRatingParamsSchema }>,
		reply: FastifyReply,
	) {
		const { id } = request.params;
		const user = await request.getCurrentUser();
		const customer = await prisma.customer.findUnique({
			where: { userId: user.id },
		});

		if (!customer) {
			throw new BadRequestError("User is not registered as a customer");
		}

		const result = await deleteRatingUseCase.execute(id, customer.id);

		return reply.status(200).send(result);
	},
};
