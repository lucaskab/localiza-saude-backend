import { prisma } from "@/database/prisma";
import type {
	MedicalRecordInput,
	MedicalRecordRepository,
} from "./medical-records-repository-contract";

export const prismaMedicalRecordRepository: MedicalRecordRepository = {
	async findByCustomerId(customerId: string) {
		const medicalRecord = await prisma.customer_medical_record.findUnique({
			where: { customerId },
		});

		return medicalRecord;
	},

	async upsertByCustomerId(customerId: string, data: MedicalRecordInput) {
		const medicalRecord = await prisma.customer_medical_record.upsert({
			where: { customerId },
			create: {
				customerId,
				bloodType: data.bloodType,
				medications: data.medications,
				chronicPain: data.chronicPain,
				preExistingConditions: data.preExistingConditions,
				allergies: data.allergies,
				surgeries: data.surgeries,
				familyHistory: data.familyHistory,
				lifestyleNotes: data.lifestyleNotes,
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
				lifestyleNotes: data.lifestyleNotes,
				emergencyContactName: data.emergencyContactName,
				emergencyContactPhone: data.emergencyContactPhone,
			},
		});

		return medicalRecord;
	},
};
