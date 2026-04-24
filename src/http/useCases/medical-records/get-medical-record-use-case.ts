import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { prismaMedicalRecordRepository } from "@/http/repositories/medical-records/medical-records-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import {
	type customer_medical_record,
	type user,
} from "../../../../prisma/generated/prisma/client";

export const getMyMedicalRecordUseCase = {
	async execute(
		userId: string,
	): Promise<{ medicalRecord: customer_medical_record | null }> {
		const customer = await prismaCustomerRepository.findByUserId(userId);

		if (!customer) {
			throw new BadRequestError("User is not registered as a customer");
		}

		const medicalRecord = await prismaMedicalRecordRepository.findByCustomerId(
			customer.id,
		);

		return { medicalRecord };
	},
};

export const getCustomerMedicalRecordUseCase = {
	async execute(
		customerId: string,
		currentUser: user,
	): Promise<{ medicalRecord: customer_medical_record | null }> {
		const customer = await prismaCustomerRepository.findById(customerId);

		if (!customer) {
			throw new BadRequestError("Customer not found");
		}

		if (customer.userId === currentUser.id) {
			const medicalRecord = await prismaMedicalRecordRepository.findByCustomerId(
				customer.id,
			);

			return { medicalRecord };
		}

		const provider = await prismaHealthcareProviderRepository.findByUserId(
			currentUser.id,
		);

		if (!provider) {
			throw new UnauthorizedError("You cannot access this medical record");
		}

		const relatedAppointment =
			await prismaAppointmentRepository.existsByCustomerAndProvider(
				customer.id,
				provider.id,
			);

		if (!relatedAppointment) {
			throw new UnauthorizedError("You cannot access this medical record");
		}

		const medicalRecord = await prismaMedicalRecordRepository.findByCustomerId(
			customer.id,
		);

		return { medicalRecord };
	},
};
