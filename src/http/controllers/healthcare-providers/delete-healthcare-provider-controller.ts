import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteHealthcareProviderUseCase } from "@/http/useCases/healthcare-providers/delete-healthcare-provider-use-case";
import type { DeleteHealthcareProviderParamsSchema } from "@/schemas/routes/healthcare-providers/delete-healthcare-provider";

export const deleteHealthcareProviderController = {
	async handle(
		request: FastifyRequest<{ Params: DeleteHealthcareProviderParamsSchema }>,
		reply: FastifyReply,
	) {
		const { id } = request.params;

		const result = await deleteHealthcareProviderUseCase.execute(id);

		return reply.status(200).send(result);
	},
};
