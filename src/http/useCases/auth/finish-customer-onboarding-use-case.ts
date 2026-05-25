import { prisma } from "@/database/prisma";
import { prismaAddressRepository } from "@/http/repositories/addresses/addresses-repository-implementation";
import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { upsertMyMedicalRecordUseCase } from "@/http/useCases/medical-records/upsert-medical-record-use-case";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { FinishCustomerOnboardingBodySchema } from "@/schemas/routes/auth/customer-onboarding";

export const finishCustomerOnboardingUseCase = {
	async execute(userId: string, data: FinishCustomerOnboardingBodySchema) {
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!existingUser) {
			throw new BadRequestError("User not found");
		}

		if (existingUser.role !== "CUSTOMER") {
			throw new BadRequestError("Only customers can finish this onboarding flow");
		}

		if (existingUser.onboardingStep !== "CUSTOMER_MEDICAL") {
			throw new BadRequestError("Medical onboarding step is not available");
		}

		if (!data.skipMedicalRecord && data.medicalRecord) {
			await upsertMyMedicalRecordUseCase.execute(userId, data.medicalRecord);
		}

		const user = await prisma.user.update({
			where: { id: userId },
			data: {
				onboardingStep: "COMPLETED",
				onboardingCompleted: true,
			},
		});

		const customer = await prismaCustomerRepository.findByUserId(userId);

		if (!customer) {
			throw new BadRequestError("Customer record not found");
		}

		const primaryAddress = await prismaAddressRepository.findPrimaryByOwner(
			"USER",
			userId,
		);

		return {
			user,
			customer,
			primaryAddress,
		};
	},
};
