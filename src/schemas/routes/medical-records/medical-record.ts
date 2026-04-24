import { z } from "zod";

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

export const medicalRecordSchema = z.object({
	id: z.string(),
	customerId: z.cuid(),
	bloodType: z.string().nullable(),
	medications: z.string().nullable(),
	chronicPain: z.string().nullable(),
	preExistingConditions: z.string().nullable(),
	allergies: z.string().nullable(),
	surgeries: z.string().nullable(),
	familyHistory: z.string().nullable(),
	lifestyleNotes: z.string().nullable(),
	emergencyContactName: z.string().nullable(),
	emergencyContactPhone: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const medicalRecordBodySchema = z.object({
	bloodType: optionalMedicalTextSchema,
	medications: optionalMedicalTextSchema,
	chronicPain: optionalMedicalTextSchema,
	preExistingConditions: optionalMedicalTextSchema,
	allergies: optionalMedicalTextSchema,
	surgeries: optionalMedicalTextSchema,
	familyHistory: optionalMedicalTextSchema,
	lifestyleNotes: optionalMedicalTextSchema,
	emergencyContactName: optionalMedicalTextSchema,
	emergencyContactPhone: optionalMedicalTextSchema,
});

export const medicalRecordResponseSchema = z.object({
	medicalRecord: medicalRecordSchema.nullable(),
});

export type MedicalRecordBodySchema = z.infer<typeof medicalRecordBodySchema>;
