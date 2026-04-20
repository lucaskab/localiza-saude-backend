import type { FastifyReply, FastifyRequest } from "fastify";
import { updateCustomerUseCase } from "@/http/useCases/customers/update-customer-use-case";
import type {
	UpdateCustomerBodySchema,
	UpdateCustomerParamsSchema,
} from "@/schemas/routes/customers/update-customer";

export const updateCustomerController = {
	async handle(
		request: FastifyRequest<{
			Params: UpdateCustomerParamsSchema;
			Body: UpdateCustomerBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const { id } = request.params;
		const data = request.body;

		const result = await updateCustomerUseCase.execute(id, data);

		return reply.status(200).send(result);
	},
};
