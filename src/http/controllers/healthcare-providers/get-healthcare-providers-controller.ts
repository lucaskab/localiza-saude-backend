import type { FastifyReply } from "fastify";
import type { FastifyRequest } from "fastify/types/request";
import { getHealthcareProvidersUseCase } from "@/http/useCases/healthcare-providers/get-healthcare-providers-use-case";

export const getHealthcareProvidersController = {
	async handle(_: FastifyRequest, reply: FastifyReply) {
		const healthcareProviders = await getHealthcareProvidersUseCase.execute();

		return reply.status(200).send(healthcareProviders);
	},
};
