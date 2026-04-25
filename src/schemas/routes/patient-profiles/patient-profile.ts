import { z } from "zod";
import { patientProfileSchema } from "@/schemas/routes/appointments/get-appointments";

const optionalTextSchema = z.preprocess((value) => {
	if (typeof value !== "string") {
		return value;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}, z.string().nullable().optional());

export const patientProfileBodySchema = z.object({
	fullName: z.string().trim().min(1),
	dateOfBirth: z.coerce.date().nullable().optional(),
	cpf: optionalTextSchema,
	phone: optionalTextSchema,
	email: optionalTextSchema,
	address: optionalTextSchema,
	gender: optionalTextSchema,
	relationshipToCustomer: optionalTextSchema,
	notes: optionalTextSchema,
	bloodType: optionalTextSchema,
	medications: optionalTextSchema,
	chronicPain: optionalTextSchema,
	preExistingConditions: optionalTextSchema,
	allergies: optionalTextSchema,
	surgeries: optionalTextSchema,
	familyHistory: optionalTextSchema,
	lifestyleNotes: optionalTextSchema,
	emergencyContactName: optionalTextSchema,
	emergencyContactPhone: optionalTextSchema,
});

export const patientProfileResponseSchema = z.object({
	patientProfile: patientProfileSchema,
});

export const patientProfilesResponseSchema = z.object({
	patientProfiles: z.array(patientProfileSchema),
});

export type PatientProfileBodySchema = z.infer<typeof patientProfileBodySchema>;
