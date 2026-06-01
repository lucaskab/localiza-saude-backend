import { z } from "zod";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const optionalMedicalTextSchema = z.preprocess(
	(value) => {
		if (typeof value !== "string") {
			return value;
		}

		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	},
	z.string().nullable().optional(),
);

const optionalBloodTypeSchema = z.preprocess(
	(value) => {
		if (typeof value !== "string") {
			return value;
		}

		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	},
	z.enum(BLOOD_TYPES).nullable().optional(),
);

export const medicalRecordSchema = z.object({
	id: z.string(),
	customerId: z.cuid().nullable(),
	patientProfileId: z.cuid().nullable().optional(),
	bloodType: z.string().nullable(),
	medications: z.string().nullable(),
	chronicPain: z.string().nullable(),
	preExistingConditions: z.string().nullable(),
	allergies: z.string().nullable(),
	surgeries: z.string().nullable(),
	familyHistory: z.string().nullable(),
	emergencyContactName: z.string().nullable(),
	emergencyContactPhone: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const medicalRecordBodySchema = z.object({
	bloodType: optionalBloodTypeSchema,
	medications: optionalMedicalTextSchema,
	chronicPain: optionalMedicalTextSchema,
	preExistingConditions: optionalMedicalTextSchema,
	allergies: optionalMedicalTextSchema,
	surgeries: optionalMedicalTextSchema,
	familyHistory: optionalMedicalTextSchema,
	emergencyContactName: optionalMedicalTextSchema,
	emergencyContactPhone: optionalMedicalTextSchema,
});

export const medicalRecordResponseSchema = z.object({
	medicalRecord: medicalRecordSchema.nullable(),
});

export type MedicalRecordBodySchema = z.infer<typeof medicalRecordBodySchema>;
