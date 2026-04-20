import type { FastifyReply, FastifyRequest } from "fastify";
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

		const result = await updateRatingUseCase.execute(id, data);

		return reply.status(200).send(result);
	},
};
