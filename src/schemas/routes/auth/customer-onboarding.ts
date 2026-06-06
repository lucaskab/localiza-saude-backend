import { z } from "zod";
import { addressInputSchema } from "@/schemas/routes/addresses/address";
import { medicalRecordBodySchema } from "@/schemas/routes/medical-records/medical-record";
import { customerSchema } from "@/schemas/routes/customers/get-customers";
import { addressSchema } from "@/schemas/routes/addresses/address";
import { phoneSchema } from "@/schemas/routes/_shared/phone";

function normalizeDigits(value: string) {
	return value.replace(/\D/g, "");
}

function normalizeCpf(value: string) {
	const digits = normalizeDigits(value);

	if (digits.length !== 11) {
		throw new Error("CPF must contain 11 digits");
	}

	return digits;
}

const cpfSchema = z
	.string()
	.trim()
	.transform((value, ctx) => {
		try {
			return normalizeCpf(value);
		} catch {
			ctx.addIssue({ code: "custom", message: "Invalid CPF" });
			return z.NEVER;
		}
	});

export const completeCustomerProfileBodySchema = z.object({
	phone: phoneSchema,
	cpf: cpfSchema,
	address: addressInputSchema,
});

export const finishCustomerOnboardingBodySchema = z.object({
	medicalRecord: medicalRecordBodySchema.optional(),
	skipMedicalRecord: z.boolean().optional(),
});

export const onboardingUserWithStepSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	phone: z.string().nullable(),
	email: z.string().email(),
	emailVerified: z.boolean(),
	image: z.string().nullable(),
	role: z.enum(["CUSTOMER", "HEALTHCARE_PROVIDER", "STAFF", "ADMIN"]),
	onboardingCompleted: z.boolean(),
	onboardingStep: z.enum([
		"ROLE",
		"CUSTOMER_PROFILE",
		"CUSTOMER_MEDICAL",
		"COMPLETED",
	]),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const customerOnboardingResponseSchema = z.object({
	user: onboardingUserWithStepSchema,
	customer: customerSchema.extend({
		primaryAddress: addressSchema.nullable().optional(),
	}),
});

export type CompleteCustomerProfileBodySchema = z.infer<
	typeof completeCustomerProfileBodySchema
>;
export type FinishCustomerOnboardingBodySchema = z.infer<
	typeof finishCustomerOnboardingBodySchema
>;

export const completeCustomerProfileRouteOptions = {
	schema: {
		tags: ["Auth"],
		summary: "Complete required customer profile data during onboarding",
		security: [{ bearerAuth: [] }],
		body: completeCustomerProfileBodySchema,
		response: {
			200: customerOnboardingResponseSchema,
		},
	},
};

export const finishCustomerOnboardingRouteOptions = {
	schema: {
		tags: ["Auth"],
		summary: "Finish customer onboarding with optional medical record",
		security: [{ bearerAuth: [] }],
		body: finishCustomerOnboardingBodySchema,
		response: {
			200: customerOnboardingResponseSchema,
		},
	},
};
