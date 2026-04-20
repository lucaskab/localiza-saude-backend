import type { FastifyReply, FastifyRequest } from "fastify";
import { createCategoryUseCase } from "@/http/useCases/categories/create-category-use-case";
import type { CreateCategoryBodySchema } from "@/schemas/routes/categories/create-category";

export const createCategoryController = {
	async handle(
		request: FastifyRequest<{ Body: CreateCategoryBodySchema }>,
		reply: FastifyReply,
	) {
		const data = request.body;

		const result = await createCategoryUseCase.execute(data);

		return reply.status(201).send(result);
	},
};
