import type { customer_medical_record } from "../../../../prisma/generated/prisma/client";

export type MedicalRecordInput = {
	bloodType?: string | null;
	medications?: string | null;
	chronicPain?: string | null;
	preExistingConditions?: string | null;
	allergies?: string | null;
	surgeries?: string | null;
	familyHistory?: string | null;
	lifestyleNotes?: string | null;
	emergencyContactName?: string | null;
	emergencyContactPhone?: string | null;
};

export type MedicalRecordRepository = {
	findByCustomerId: (
		customerId: string,
	) => Promise<customer_medical_record | null>;
	upsertByCustomerId: (
		customerId: string,
		data: MedicalRecordInput,
	) => Promise<customer_medical_record>;
};
