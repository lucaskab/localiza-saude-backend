import type { FastifyReply, FastifyRequest } from "fastify";
import { createCustomerUseCase } from "@/http/useCases/customers/create-customer-use-case";
import type { CreateCustomerBodySchema } from "@/schemas/routes/customers/create-customer";

export const createCustomerController = {
	async handle(
		request: FastifyRequest<{ Body: CreateCustomerBodySchema }>,
		reply: FastifyReply,
	) {
		const data = request.body;

		const result = await createCustomerUseCase.execute(data);

		return reply.status(201).send(result);
	},
};
