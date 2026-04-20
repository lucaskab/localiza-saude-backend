import type { FastifyReply, FastifyRequest } from "fastify";
import { getCategoryByIdUseCase } from "@/http/useCases/categories/get-category-by-id-use-case";
import type { GetCategoryByIdParamsSchema } from "@/schemas/routes/categories/get-category-by-id";

export const getCategoryByIdController = {
	async handle(
		request: FastifyRequest<{ Params: GetCategoryByIdParamsSchema }>,
		reply: FastifyReply,
	) {
		const { id } = request.params;

		const result = await getCategoryByIdUseCase.execute(id);

		return reply.status(200).send(result);
	},
};
