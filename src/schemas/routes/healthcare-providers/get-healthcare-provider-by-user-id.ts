import { z } from "zod";

const userSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	email: z.string().email(),
	phone: z.string().nullable(),
	image: z.string().nullable(),
	role: z.string(),
});

const procedureSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	description: z.string().nullable(),
	priceInCents: z.number().int(),
	durationInMinutes: z.number().int(),
	healthcareProviderId: z.cuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const healthcareProviderFaqSchema = z.object({
	id: z.cuid(),
	healthcareProviderId: z.cuid(),
	question: z.string(),
	answer: z.string(),
	position: z.number().int(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const healthcareProviderSchema = z.object({
	id: z.cuid(),
	userId: z.string(),
	displayName: z.string().nullable().optional(),
	document: z.string().nullable().optional(),
	birthDate: z.date().nullable().optional(),
	gender: z.string().nullable().optional(),
	languages: z.array(z.string()).optional(),
	specialty: z.string().nullable(),
	professionalCategory: z.string().nullable().optional(),
	professionalId: z.string().nullable(),
	licenseCouncil: z.string().nullable().optional(),
	licenseState: z.string().nullable().optional(),
	licenseDocumentFileName: z.string().nullable().optional(),
	licenseDocumentMimeType: z.string().nullable().optional(),
	licenseDocumentSize: z.number().int().nullable().optional(),
	licenseDocumentSha256: z.string().nullable().optional(),
	licenseDocumentUploadedAt: z.date().nullable().optional(),
	verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
	verifiedAt: z.date().nullable().optional(),
	bio: z.string().nullable(),
	approach: z.string().nullable().optional(),
	education: z.string().nullable().optional(),
	certifications: z.string().nullable().optional(),
	yearsOfExperience: z.number().int().nullable().optional(),
	targetAudiences: z.array(z.string()).optional(),
	serviceModalities: z.array(z.string()).optional(),
	clinicAddress: z.string().nullable().optional(),
	homeCareRadiusKm: z.number().int().nullable().optional(),
	acceptedInsurance: z.array(z.string()).optional(),
	paymentMethods: z.array(z.string()).optional(),
	cancellationPolicy: z.string().nullable().optional(),
	clinicPhotos: z.array(z.string()).optional(),
	termsAcceptedAt: z.date().nullable().optional(),
	lgpdConsentAt: z.date().nullable().optional(),
	professionalResponsibilityAcceptedAt: z.date().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
	user: userSchema,
	procedures: z.array(procedureSchema),
	faqs: z.array(healthcareProviderFaqSchema).optional(),
});

export const getHealthcareProviderByUserIdParamsSchema = z.object({
	userId: z.string(),
});

export const getHealthcareProviderByUserIdResponseSchema = z.object({
	healthcareProvider: healthcareProviderSchema,
});

export type GetHealthcareProviderByUserIdParamsSchema = z.infer<
	typeof getHealthcareProviderByUserIdParamsSchema
>;
export type GetHealthcareProviderByUserIdResponseSchema = z.infer<
	typeof getHealthcareProviderByUserIdResponseSchema
>;

export const getHealthcareProviderByUserIdRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Get healthcare provider by user ID",
		security: [{ bearerAuth: [] }],
		params: getHealthcareProviderByUserIdParamsSchema,
		response: {
			200: getHealthcareProviderByUserIdResponseSchema,
		},
	},
};
