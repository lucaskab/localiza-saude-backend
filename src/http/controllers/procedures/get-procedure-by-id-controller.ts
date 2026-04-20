import type { FastifyReply, FastifyRequest } from "fastify";
import { getProcedureByIdUseCase } from "@/http/useCases/procedures/get-procedure-by-id-use-case";
import type { GetProcedureByIdParamsSchema } from "@/schemas/routes/procedures/get-procedure-by-id";

export const getProcedureByIdController = {
	async handle(
		request: FastifyRequest<{ Params: GetProcedureByIdParamsSchema }>,
		reply: FastifyReply,
	) {
		const { id } = request.params;

		const result = await getProcedureByIdUseCase.execute(id);

		return reply.status(200).send(result);
	},
};
