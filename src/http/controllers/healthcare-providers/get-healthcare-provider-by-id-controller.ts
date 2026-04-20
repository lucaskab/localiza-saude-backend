import type { FastifyReply, FastifyRequest } from "fastify";
import { getHealthcareProviderByIdUseCase } from "@/http/useCases/healthcare-providers/get-healthcare-provider-by-id-use-case";
import type { GetHealthcareProviderByIdParamsSchema } from "@/schemas/routes/healthcare-providers/get-healthcare-provider-by-id";

export const getHealthcareProviderByIdController = {
	async handle(
		request: FastifyRequest<{ Params: GetHealthcareProviderByIdParamsSchema }>,
		reply: FastifyReply,
	) {
		const { id } = request.params;

		const result = await getHealthcareProviderByIdUseCase.execute(id);

		return reply.status(200).send(result);
	},
};
