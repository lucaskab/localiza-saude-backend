import type { FastifyReply } from "fastify";
import type { FastifyRequest } from "fastify/types/request";
import { getHealthcareProvidersUseCase } from "@/http/useCases/healthcare-providers/get-healthcare-providers-use-case";
import type { GetHealthcareProvidersQuerySchema } from "@/schemas/routes/healthcare-providers/get-healthcare-providers";

export const getHealthcareProvidersController = {
	async handle(
		request: FastifyRequest<{ Querystring: GetHealthcareProvidersQuerySchema }>,
		reply: FastifyReply,
	) {
		const healthcareProviders = await getHealthcareProvidersUseCase.execute(
			request.query,
		);

		return reply.status(200).send(healthcareProviders);
	},
};
