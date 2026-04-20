import type { FastifyReply, FastifyRequest } from "fastify";
import { getCustomerByUserIdUseCase } from "@/http/useCases/customers/get-customer-by-user-id-use-case";
import type { GetCustomerByUserIdParamsSchema } from "@/schemas/routes/customers/get-customer-by-user-id";

export const getCustomerByUserIdController = {
	async handle(
		request: FastifyRequest<{ Params: GetCustomerByUserIdParamsSchema }>,
		reply: FastifyReply,
	) {
		const { userId } = request.params;

		const result = await getCustomerByUserIdUseCase.execute(userId);

		return reply.status(200).send(result);
	},
};
