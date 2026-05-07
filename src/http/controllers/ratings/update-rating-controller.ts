import type { FastifyReply, FastifyRequest } from "fastify";
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

		if (user.role !== "CUSTOMER") {
			throw new BadRequestError("User role must be CUSTOMER to update a rating");
		}

		const result = await updateRatingUseCase.execute(id, data, user.id);

		return reply.status(200).send(result);
	},
};
