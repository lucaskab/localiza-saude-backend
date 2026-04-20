import type { FastifyReply, FastifyRequest } from "fastify";
import { updateProcedureUseCase } from "@/http/useCases/procedures/update-procedure-use-case";
import type {
	UpdateProcedureBodySchema,
	UpdateProcedureParamsSchema,
} from "@/schemas/routes/procedures/update-procedure";

export const updateProcedureController = {
	async handle(
		request: FastifyRequest<{
			Params: UpdateProcedureParamsSchema;
			Body: UpdateProcedureBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const { id } = request.params;
		const data = request.body;

		const result = await updateProcedureUseCase.execute(id, data);

		return reply.status(200).send(result);
	},
};
