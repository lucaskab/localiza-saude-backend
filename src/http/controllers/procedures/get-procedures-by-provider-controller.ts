import type { FastifyReply, FastifyRequest } from "fastify";
import { getProceduresByProviderUseCase } from "@/http/useCases/procedures/get-procedures-by-provider-use-case";
import type { GetProceduresByProviderParamsSchema } from "@/schemas/routes/procedures/get-procedures-by-provider";

export const getProceduresByProviderController = {
	async handle(
		request: FastifyRequest<{ Params: GetProceduresByProviderParamsSchema }>,
		reply: FastifyReply,
	) {
		const { healthcareProviderId } = request.params;

		const result =
			await getProceduresByProviderUseCase.execute(healthcareProviderId);

		return reply.status(200).send(result);
	},
};
