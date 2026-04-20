import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteCategoryUseCase } from "@/http/useCases/categories/delete-category-use-case";
import type { DeleteCategoryParamsSchema } from "@/schemas/routes/categories/delete-category";

export const deleteCategoryController = {
	async handle(
		request: FastifyRequest<{ Params: DeleteCategoryParamsSchema }>,
		reply: FastifyReply,
	) {
		const { id } = request.params;

		const result = await deleteCategoryUseCase.execute(id);

		return reply.status(200).send(result);
	},
};
