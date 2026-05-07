import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { user } from "../../../../prisma/generated/prisma/client";

export const getCustomerByUserIdUseCase = {
	async execute(userId: string): Promise<{ customer: user }> {
		const customer = await prismaCustomerRepository.findByUserId(userId);

		if (!customer) {
			throw new BadRequestError("Customer not found");
		}

		return { customer };
	},
};
