import type { FastifyReply, FastifyRequest } from "fastify";
import { createProcedureUseCase } from "@/http/useCases/procedures/create-procedure-use-case";
import type { CreateProcedureBodySchema } from "@/schemas/routes/procedures/create-procedure";

export const createProcedureController = {
	async handle(
		request: FastifyRequest<{ Body: CreateProcedureBodySchema }>,
		reply: FastifyReply,
	) {
		const data = request.body;

		const result = await createProcedureUseCase.execute(data);

		return reply.status(201).send(result);
	},
};
