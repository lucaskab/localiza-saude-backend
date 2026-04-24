import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/database/prisma";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { updateRatingUseCase } from "@/http/useCases/ratings/update-rating-use-case";
import type {
	UpdateRatingBodySchema,
	UpdateRatingParamsSchema,
} from "@/schemas/routes/ratings/update-rating";

export const updateRatingController = {
	async handle(
		request: FastifyRequest<{
			Params: UpdateRatingParamsSchema;
			Body: UpdateRatingBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const { id } = request.params;
		const data = request.body;
		const user = await request.getCurrentUser();
		const customer = await prisma.customer.findUnique({
			where: { userId: user.id },
		});

		if (!customer) {
			throw new BadRequestError("User is not registered as a customer");
		}

		const result = await updateRatingUseCase.execute(id, data, customer.id);

		return reply.status(200).send(result);
	},
};
