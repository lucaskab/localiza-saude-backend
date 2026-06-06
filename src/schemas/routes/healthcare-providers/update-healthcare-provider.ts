import { z } from "zod";
import { addressInputSchema } from "@/schemas/routes/addresses/address";
import { serviceModalitySchema } from "@/schemas/service-modalities";
import { healthcareProviderSchema } from "./get-healthcare-providers";

const entityIdSchema = z.cuid();

const professionalFaqInputSchema = z.object({
	question: z.string().trim().min(3).max(300),
	answer: z.string().trim().min(3).max(1200),
});

export const updateHealthcareProviderParamsSchema = z.object({
	id: entityIdSchema,
});

export const updateHealthcareProviderBodySchema = z.object({
	displayName: z.string().trim().nullable().optional(),
	document: z.string().trim().nullable().optional(),
	birthDate: z.coerce.date().nullable().optional(),
	gender: z.string().trim().nullable().optional(),
	languages: z.array(z.string().trim().min(1)).optional(),
	specialty: z.string().trim().nullable().optional(),
	professionalCategory: z.string().trim().nullable().optional(),
	professionalId: z.string().trim().nullable().optional(),
	professionalCouncilId: z.cuid().nullable().optional(),
	licenseState: z.string().trim().nullable().optional(),
	bio: z.string().trim().nullable().optional(),
	approach: z.string().trim().nullable().optional(),
	education: z.string().trim().nullable().optional(),
	certifications: z.string().trim().nullable().optional(),
	yearsOfExperience: z.number().int().min(0).nullable().optional(),
	targetAudiences: z.array(z.string().trim().min(1)).optional(),
	serviceModalities: z.array(serviceModalitySchema).optional(),
	address: addressInputSchema.nullable().optional(),
	homeCareRadiusKm: z.number().int().min(0).nullable().optional(),
	acceptedHealthInsurancePlanIds: z.array(entityIdSchema).optional(),
	paymentMethods: z.array(z.string().trim().min(1)).optional(),
	bookingAvailabilityDays: z.number().int().min(1).max(365).nullable().optional(),
	appointmentConfirmationReminderHoursBefore: z.number().int().min(1).max(168).nullable().optional(),
	appointmentReminderHoursBefore: z.number().int().min(1).max(168).nullable().optional(),
	birthdayGreetingEmailEnabled: z.boolean().optional(),
	birthdayGreetingEmailSubjectTemplate: z.string().trim().min(1).max(200).nullable().optional(),
	birthdayGreetingEmailHtmlTemplate: z.string().trim().min(1).max(50000).nullable().optional(),
	cancellationPolicy: z.string().trim().nullable().optional(),
	cancellationPolicyEnabled: z.boolean().optional(),
	cancellationPolicyHoursBefore: z.number().int().min(0).max(720).nullable().optional(),
	cancellationPolicyPenaltyType: z.enum(["FIXED", "PERCENTAGE"]).nullable().optional(),
	cancellationPolicyFixedFeeCents: z.number().int().min(0).nullable().optional(),
	cancellationPolicyPercentage: z.number().int().min(0).max(100).nullable().optional(),
	cancellationPolicyRequiresJustification: z.boolean().optional(),
	termsAcceptedAt: z.coerce.date().nullable().optional(),
	lgpdConsentAt: z.coerce.date().nullable().optional(),
	professionalResponsibilityAcceptedAt: z.coerce.date().nullable().optional(),
	faqs: z.array(professionalFaqInputSchema).max(20).optional(),
});

export const updateHealthcareProviderResponseSchema = z.object({
	healthcareProvider: healthcareProviderSchema,
});

export type UpdateHealthcareProviderParamsSchema = z.infer<
	typeof updateHealthcareProviderParamsSchema
>;
export type UpdateHealthcareProviderBodySchema = z.infer<
	typeof updateHealthcareProviderBodySchema
>;
export type UpdateHealthcareProviderResponseSchema = z.infer<
	typeof updateHealthcareProviderResponseSchema
>;

export const updateHealthcareProviderRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Update a healthcare provider",
		security: [{ bearerAuth: [] }],
		params: updateHealthcareProviderParamsSchema,
		body: updateHealthcareProviderBodySchema,
		response: {
			200: updateHealthcareProviderResponseSchema,
		},
	},
};
