import type { FastifyReply, FastifyRequest } from "fastify";
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

		if (user.role !== "CUSTOMER") {
			throw new BadRequestError("User role must be CUSTOMER to delete a rating");
		}

		const result = await deleteRatingUseCase.execute(id, user.id);

		return reply.status(200).send(result);
	},
};
