import type { FastifyRequest } from "fastify";
import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export async function getAuthenticatedCustomerId(request: FastifyRequest) {
	const user = await request.getCurrentUser();
	const customer = await prismaCustomerRepository.findByUserId(user.id);

	if (!customer) {
		throw new BadRequestError("User is not registered as a customer");
	}

	return customer.id;
}
