import type { FastifyReply, FastifyRequest } from "fastify";
import { getCustomerByIdUseCase } from "@/http/useCases/customers/get-customer-by-id-use-case";
import type { GetCustomerByIdParamsSchema } from "@/schemas/routes/customers/get-customer-by-id";

export const getCustomerByIdController = {
	async handle(
		request: FastifyRequest<{ Params: GetCustomerByIdParamsSchema }>,
		reply: FastifyReply,
	) {
		const { id } = request.params;

		const result = await getCustomerByIdUseCase.execute(id);

		return reply.status(200).send(result);
	},
};
