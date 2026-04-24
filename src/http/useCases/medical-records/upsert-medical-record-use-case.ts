import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { prismaMedicalRecordRepository } from "@/http/repositories/medical-records/medical-records-repository-implementation";
import type { MedicalRecordInput } from "@/http/repositories/medical-records/medical-records-repository-contract";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { customer_medical_record } from "../../../../prisma/generated/prisma/client";

export const upsertMyMedicalRecordUseCase = {
	async execute(
		userId: string,
		data: MedicalRecordInput,
	): Promise<{ medicalRecord: customer_medical_record }> {
		const customer = await prismaCustomerRepository.findByUserId(userId);

		if (!customer) {
			throw new BadRequestError("User is not registered as a customer");
		}

		const medicalRecord = await prismaMedicalRecordRepository.upsertByCustomerId(
			customer.id,
			data,
		);

		return { medicalRecord };
	},
};
