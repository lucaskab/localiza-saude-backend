import type { UpdateCustomerData } from "@/http/repositories/customers/customers-repository-contract";
import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { customer } from "../../../../prisma/generated/prisma/client";

export const updateCustomerUseCase = {
	async execute(
		id: string,
		data: UpdateCustomerData,
	): Promise<{ customer: customer }> {
		const existingCustomer = await prismaCustomerRepository.findById(id);

		if (!existingCustomer) {
			throw new BadRequestError("Customer not found");
		}

		const customer = await prismaCustomerRepository.update(id, data);

		return { customer };
	},
};
