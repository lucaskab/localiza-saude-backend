import { prisma } from "@/database/prisma";
import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { upsertPrimaryAddressUseCase } from "@/http/useCases/addresses/upsert-primary-address-use-case";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { CompleteCustomerProfileBodySchema } from "@/schemas/routes/auth/customer-onboarding";

export const completeCustomerProfileUseCase = {
	async execute(userId: string, data: CompleteCustomerProfileBodySchema) {
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!existingUser) {
			throw new BadRequestError("User not found");
		}

		if (existingUser.role !== "CUSTOMER") {
			throw new BadRequestError("Only customers can complete this onboarding step");
		}

		if (existingUser.onboardingStep !== "CUSTOMER_PROFILE") {
			throw new BadRequestError("Customer profile onboarding step is not available");
		}

		const duplicateCpf = await prisma.user.findFirst({
			where: {
				cpf: data.cpf,
				id: { not: userId },
			},
			select: { id: true },
		});

		if (duplicateCpf) {
			throw new BadRequestError("CPF is already registered");
		}

		const primaryAddress = await upsertPrimaryAddressUseCase.execute(
			"USER",
			userId,
			data.address,
		);

		const user = await prisma.user.update({
			where: { id: userId },
			data: {
				phone: data.phone,
				cpf: data.cpf,
				onboardingStep: "CUSTOMER_MEDICAL",
			},
		});

		const customer = await prismaCustomerRepository.findByUserId(userId);

		if (!customer) {
			throw new BadRequestError("Customer record not found");
		}

		return {
			user,
			customer,
			primaryAddress,
		};
	},
};
