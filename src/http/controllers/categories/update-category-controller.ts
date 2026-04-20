import type { FastifyReply, FastifyRequest } from "fastify";
import { updateCategoryUseCase } from "@/http/useCases/categories/update-category-use-case";
import type {
	UpdateCategoryBodySchema,
	UpdateCategoryParamsSchema,
} from "@/schemas/routes/categories/update-category";

export const updateCategoryController = {
	async handle(
		request: FastifyRequest<{
			Params: UpdateCategoryParamsSchema;
			Body: UpdateCategoryBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const { id } = request.params;
		const data = request.body;

		const result = await updateCategoryUseCase.execute(id, data);

		return reply.status(200).send(result);
	},
};
