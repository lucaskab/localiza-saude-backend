import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteRatingUseCase } from "@/http/useCases/ratings/delete-rating-use-case";
import type { DeleteRatingParamsSchema } from "@/schemas/routes/ratings/delete-rating";

export const deleteRatingController = {
	async handle(
		request: FastifyRequest<{ Params: DeleteRatingParamsSchema }>,
		reply: FastifyReply,
	) {
		const { id } = request.params;

		const result = await deleteRatingUseCase.execute(id);

		return reply.status(200).send(result);
	},
};
