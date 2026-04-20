import type { FastifyReply, FastifyRequest } from "fastify";
import { updateHealthcareProviderUseCase } from "@/http/useCases/healthcare-providers/update-healthcare-provider-use-case";
import type {
	UpdateHealthcareProviderBodySchema,
	UpdateHealthcareProviderParamsSchema,
} from "@/schemas/routes/healthcare-providers/update-healthcare-provider";

export const updateHealthcareProviderController = {
	async handle(
		request: FastifyRequest<{
			Params: UpdateHealthcareProviderParamsSchema;
			Body: UpdateHealthcareProviderBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const { id } = request.params;
		const data = request.body;

		const result = await updateHealthcareProviderUseCase.execute(id, data);

		return reply.status(200).send(result);
	},
};
