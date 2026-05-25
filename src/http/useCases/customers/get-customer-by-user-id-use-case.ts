import { prismaAddressRepository } from "@/http/repositories/addresses/addresses-repository-implementation";
import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { addressPresenter } from "@/http/presenters/address-presenter";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { user } from "../../../../prisma/generated/prisma/client";

export const getCustomerByUserIdUseCase = {
	async execute(userId: string): Promise<{
		customer: user & { primaryAddress: ReturnType<typeof addressPresenter.toHTTP> | null };
	}> {
		const customer = await prismaCustomerRepository.findByUserId(userId);

		if (!customer) {
			throw new BadRequestError("Customer not found");
		}

		const primaryAddress = await prismaAddressRepository.findPrimaryByOwner(
			"USER",
			userId,
		);

		return {
			customer: {
				...customer,
				primaryAddress: primaryAddress
					? addressPresenter.toHTTP(primaryAddress)
					: null,
			},
		};
	},
};
