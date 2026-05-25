import type { UpdateCustomerData } from "@/http/repositories/customers/customers-repository-contract";
import { prismaAddressRepository } from "@/http/repositories/addresses/addresses-repository-implementation";
import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { addressPresenter } from "@/http/presenters/address-presenter";
import { upsertPrimaryAddressUseCase } from "@/http/useCases/addresses/upsert-primary-address-use-case";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import type { user } from "../../../../../prisma/generated/prisma/client";

export const updateCustomerUseCase = {
	async execute(
		params: {
			customerId: string;
			currentUser: user;
			data: UpdateCustomerData;
		},
	): Promise<{ customer: user & { primaryAddress: ReturnType<typeof addressPresenter.toHTTP> | null } }> {
		const { customerId, currentUser, data } = params;

		if (currentUser.role !== "ADMIN" && currentUser.id !== customerId) {
			throw new UnauthorizedError();
		}

		const existingCustomer = await prismaCustomerRepository.findById(customerId);

		if (!existingCustomer) {
			throw new BadRequestError("Customer not found");
		}

		const customer = await prismaCustomerRepository.update(customerId, data);

		const primaryAddress = data.address
			? await upsertPrimaryAddressUseCase.execute("USER", customer.id, data.address)
			: await prismaAddressRepository.findPrimaryByOwner("USER", customer.id);

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
