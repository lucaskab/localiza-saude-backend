import type { FastifyReply, FastifyRequest } from "fastify";
import { createHealthcareProviderUseCase } from "@/http/useCases/healthcare-providers/create-healthcare-provider-use-case";
import type { CreateHealthcareProviderBodySchema } from "@/schemas/routes/healthcare-providers/create-healthcare-provider";

export const createHealthcareProviderController = {
	async handle(
		request: FastifyRequest<{ Body: CreateHealthcareProviderBodySchema }>,
		reply: FastifyReply,
	) {
		const data = request.body;

		const result = await createHealthcareProviderUseCase.execute(data);

		return reply.status(201).send(result);
	},
};
