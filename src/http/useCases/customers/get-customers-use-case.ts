import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import type { customer } from "../../../../prisma/generated/prisma/client";

export const getCustomersUseCase = {
	async execute(): Promise<{ customers: customer[] }> {
		const customers = await prismaCustomerRepository.findAll();

		return { customers };
	},
};
