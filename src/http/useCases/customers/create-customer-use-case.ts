import type { CreateCustomerData } from "@/http/repositories/customers/customers-repository-contract";
import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import type { customer } from "../../../../prisma/generated/prisma/client";

export const createCustomerUseCase = {
	async execute(data: CreateCustomerData): Promise<{ customer: customer }> {
		const customer = await prismaCustomerRepository.create(data);

		return { customer };
	},
};
