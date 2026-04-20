import type { FastifyReply } from "fastify";
import type { FastifyRequest } from "fastify/types/request";
import { getProceduresUseCase } from "@/http/useCases/procedures/get-procedures-use-case";

export const getProceduresController = {
	async handle(_: FastifyRequest, reply: FastifyReply) {
		const procedures = await getProceduresUseCase.execute();

		return reply.status(200).send(procedures);
	},
};
