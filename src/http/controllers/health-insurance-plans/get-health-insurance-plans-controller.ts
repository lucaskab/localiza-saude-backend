import type { FastifyReply, FastifyRequest } from "fastify";
import { getHealthInsurancePlansUseCase } from "@/http/useCases/health-insurance-plans/get-health-insurance-plans-use-case";

export const getHealthInsurancePlansController = {
	async handle(_request: FastifyRequest, reply: FastifyReply) {
		const result = await getHealthInsurancePlansUseCase.execute();

		return reply.status(200).send(result);
	},
};
