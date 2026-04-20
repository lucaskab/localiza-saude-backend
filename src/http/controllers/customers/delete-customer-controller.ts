import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteCustomerUseCase } from "@/http/useCases/customers/delete-customer-use-case";
import type { DeleteCustomerParamsSchema } from "@/schemas/routes/customers/delete-customer";

export const deleteCustomerController = {
	async handle(
		request: FastifyRequest<{ Params: DeleteCustomerParamsSchema }>,
		reply: FastifyReply,
	) {
		const { id } = request.params;

		const result = await deleteCustomerUseCase.execute(id);

		return reply.status(200).send(result);
	},
};
