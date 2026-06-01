import { prisma } from "@/database/prisma";
import type {
	MedicalRecordInput,
	MedicalRecordRepository,
} from "./medical-records-repository-contract";

export const prismaMedicalRecordRepository: MedicalRecordRepository = {
	async findByUserId(userId: string) {
		const medicalRecord = await prisma.customer_medical_record.findUnique({
			where: { customerId: userId },
		});

		return medicalRecord;
	},

	async upsertByUserId(userId: string, data: MedicalRecordInput) {
		const medicalRecord = await prisma.customer_medical_record.upsert({
			where: { customerId: userId },
			create: {
				customerId: userId,
				bloodType: data.bloodType,
				medications: data.medications,
				chronicPain: data.chronicPain,
				preExistingConditions: data.preExistingConditions,
				allergies: data.allergies,
				surgeries: data.surgeries,
				familyHistory: data.familyHistory,
				emergencyContactName: data.emergencyContactName,
				emergencyContactPhone: data.emergencyContactPhone,
			},
			update: {
				bloodType: data.bloodType,
				medications: data.medications,
				chronicPain: data.chronicPain,
				preExistingConditions: data.preExistingConditions,
				allergies: data.allergies,
				surgeries: data.surgeries,
				familyHistory: data.familyHistory,
				emergencyContactName: data.emergencyContactName,
				emergencyContactPhone: data.emergencyContactPhone,
			},
		});

		return medicalRecord;
	},
};
