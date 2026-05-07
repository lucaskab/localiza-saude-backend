import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import type { user } from "../../../../prisma/generated/prisma/client";

export const getCustomersUseCase = {
	async execute(): Promise<{ customers: user[] }> {
		const customers = await prismaCustomerRepository.findAll();

		return { customers };
	},
};
