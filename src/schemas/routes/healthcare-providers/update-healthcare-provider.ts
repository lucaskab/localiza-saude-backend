import { z } from "zod";
import { healthcareProviderSchema } from "./get-healthcare-providers";

export const updateHealthcareProviderParamsSchema = z.object({
	id: z.cuid(),
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
	licenseCouncil: z.string().trim().nullable().optional(),
	licenseState: z.string().trim().nullable().optional(),
	verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
	verifiedAt: z.coerce.date().nullable().optional(),
	bio: z.string().trim().nullable().optional(),
	approach: z.string().trim().nullable().optional(),
	education: z.string().trim().nullable().optional(),
	certifications: z.string().trim().nullable().optional(),
	yearsOfExperience: z.number().int().min(0).nullable().optional(),
	targetAudiences: z.array(z.string().trim().min(1)).optional(),
	serviceModalities: z.array(z.string().trim().min(1)).optional(),
	clinicAddress: z.string().trim().nullable().optional(),
	homeCareRadiusKm: z.number().int().min(0).nullable().optional(),
	acceptedInsurance: z.array(z.string().trim().min(1)).optional(),
	paymentMethods: z.array(z.string().trim().min(1)).optional(),
	cancellationPolicy: z.string().trim().nullable().optional(),
	clinicPhotos: z.array(z.string().trim().min(1)).optional(),
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
