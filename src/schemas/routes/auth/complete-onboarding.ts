import { z } from "zod";

export const completeOnboardingBodySchema = z.object({
	role: z.enum(["CUSTOMER", "HEALTHCARE_PROVIDER"]),
});

export const onboardingUserSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	phone: z.string().nullable(),
	email: z.string().email(),
	emailVerified: z.boolean(),
	image: z.string().nullable(),
	role: z.enum(["CUSTOMER", "HEALTHCARE_PROVIDER"]),
	onboardingCompleted: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const completeOnboardingResponseSchema = z.object({
	user: onboardingUserSchema,
	customer: z.unknown().nullable(),
	healthcareProvider: z.unknown().nullable(),
});

export type CompleteOnboardingBodySchema = z.infer<
	typeof completeOnboardingBodySchema
>;

export const completeOnboardingRouteOptions = {
	schema: {
		tags: ["Auth"],
		summary: "Complete first login onboarding by selecting the account role",
		security: [{ bearerAuth: [] }],
		body: completeOnboardingBodySchema,
		response: {
			200: completeOnboardingResponseSchema,
		},
	},
};
