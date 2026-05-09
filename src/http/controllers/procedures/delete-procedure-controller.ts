import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteProcedureUseCase } from "@/http/useCases/procedures/delete-procedure-use-case";
import type { DeleteProcedureParamsSchema } from "@/schemas/routes/procedures/delete-procedure";

export const deleteProcedureController = {
	async handle(
		request: FastifyRequest<{ Params: DeleteProcedureParamsSchema }>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const { id } = request.params;

		const result = await deleteProcedureUseCase.execute(user, id);

		return reply.status(200).send(result);
	},
};
