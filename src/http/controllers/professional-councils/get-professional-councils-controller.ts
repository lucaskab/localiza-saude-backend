import type { FastifyReply, FastifyRequest } from "fastify";
import { getProfessionalCouncilsUseCase } from "@/http/useCases/professional-councils/get-professional-councils-use-case";

export const getProfessionalCouncilsController = {
	async handle(_request: FastifyRequest, reply: FastifyReply) {
		const result = await getProfessionalCouncilsUseCase.execute();

		return reply.status(200).send(result);
	},
};
