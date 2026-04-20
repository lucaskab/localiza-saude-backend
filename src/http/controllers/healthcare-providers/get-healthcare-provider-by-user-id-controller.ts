import type { FastifyReply, FastifyRequest } from "fastify";
import { getHealthcareProviderByUserIdUseCase } from "@/http/useCases/healthcare-providers/get-healthcare-provider-by-user-id-use-case";
import type { GetHealthcareProviderByUserIdParamsSchema } from "@/schemas/routes/healthcare-providers/get-healthcare-provider-by-user-id";

export const getHealthcareProviderByUserIdController = {
	async handle(
		request: FastifyRequest<{
			Params: GetHealthcareProviderByUserIdParamsSchema;
		}>,
		reply: FastifyReply,
	) {
		const { userId } = request.params;

		const result = await getHealthcareProviderByUserIdUseCase.execute(userId);

		return reply.status(200).send(result);
	},
};
