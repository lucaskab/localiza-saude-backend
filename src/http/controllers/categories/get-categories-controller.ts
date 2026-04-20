import type { FastifyReply, FastifyRequest } from "fastify";
import { getCategoriesUseCase } from "@/http/useCases/categories/get-categories-use-case";

export const getCategoriesController = {
	async handle(request: FastifyRequest, reply: FastifyReply) {
		const result = await getCategoriesUseCase.execute();

		return reply.status(200).send(result);
	},
};
