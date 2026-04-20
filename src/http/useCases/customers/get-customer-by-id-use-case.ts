import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { customer } from "../../../../prisma/generated/prisma/client";

export const getCustomerByIdUseCase = {
	async execute(id: string): Promise<{ customer: customer }> {
		const customer = await prismaCustomerRepository.findById(id);

		if (!customer) {
			throw new BadRequestError("Customer not found");
		}

		return { customer };
	},
};
