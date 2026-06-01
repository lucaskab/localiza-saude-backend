import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuthenticatedCustomerId } from "@/http/controllers/favorites/get-authenticated-customer-id";
import { getCustomerHomeSummaryUseCase } from "@/http/useCases/customers/get-customer-home-summary-use-case";

export const getCustomerHomeSummaryController = {
	async handle(request: FastifyRequest, reply: FastifyReply) {
		const customerId = await getAuthenticatedCustomerId(request);
		const result = await getCustomerHomeSummaryUseCase.execute(customerId);

		return reply.status(200).send(result);
	},
};
