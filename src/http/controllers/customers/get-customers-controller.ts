import type { FastifyReply, FastifyRequest } from "fastify";
import { getCustomersUseCase } from "@/http/useCases/customers/get-customers-use-case";

export const getCustomersController = {
	async handle(request: FastifyRequest, reply: FastifyReply) {
		const result = await getCustomersUseCase.execute();

		return reply.status(200).send(result);
	},
};
