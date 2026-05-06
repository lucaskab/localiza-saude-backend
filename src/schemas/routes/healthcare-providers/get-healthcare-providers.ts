import { z } from "zod";
import { procedureSchema } from "../procedures/get-procedures";

const booleanQuerySchema = z
	.enum(["true", "false"])
	.transform((value) => value === "true");

export const getHealthcareProvidersQuerySchema = z.object({
	search: z.string().trim().optional(),
	specialty: z.string().trim().optional(),
	serviceModality: z.string().trim().optional(),
	language: z.string().trim().optional(),
	insurance: z.string().trim().optional(),
	verified: booleanQuerySchema.optional(),
	superProfessional: booleanQuerySchema.optional(),
	available: booleanQuerySchema.optional(),
	minRating: z.coerce.number().min(0).max(5).optional(),
	maxPriceCents: z.coerce.number().int().min(0).optional(),
	limit: z.coerce.number().int().min(1).max(50).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});

const userSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	email: z.email(),
	phone: z.string().nullable().optional(),
	image: z.string().nullable().optional(),
	role: z.enum(["HEALTHCARE_PROVIDER", "CUSTOMER"]),
});

export const healthcareProviderFaqSchema = z.object({
	id: z.cuid(),
	healthcareProviderId: z.cuid(),
	question: z.string(),
	answer: z.string(),
	position: z.number().int(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const healthcareProviderSchema = z.object({
	id: z.cuid(),
	userId: z.cuid(),
	user: userSchema,
	displayName: z.string().nullable().optional(),
	languages: z.array(z.string()).optional(),
	specialty: z.string().nullable().optional(),
	professionalCategory: z.string().nullable().optional(),
	professionalId: z.string().nullable().optional(),
	licenseCouncil: z.string().nullable().optional(),
	licenseState: z.string().nullable().optional(),
	verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
	bio: z.string().nullable().optional(),
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
	nextAvailableAt: z.date().nullable().optional(),
	startingPriceCents: z.number().int().nullable().optional(),
	averageRating: z.number().optional(),
	totalRatings: z.number().int().optional(),
	completedAppointments: z.number().int().optional(),
	confirmationRate: z.number().optional(),
	isSuperProfessional: z.boolean().optional(),
	procedures: z.array(procedureSchema),
	faqs: z.array(healthcareProviderFaqSchema).optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const getHealthcareProvidersResponseSchema = z.object({
	healthcareProviders: z.array(healthcareProviderSchema),
	total: z.number().int(),
	limit: z.number().int(),
	offset: z.number().int(),
	hasMore: z.boolean(),
});

export type GetHealthcareProvidersResponseSchema = z.infer<
	typeof getHealthcareProvidersResponseSchema
>;
export type GetHealthcareProvidersQuerySchema = z.infer<
	typeof getHealthcareProvidersQuerySchema
>;

export const getHealthcareProvidersRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Get all healthcare providers",
		querystring: getHealthcareProvidersQuerySchema,
		response: {
			200: getHealthcareProvidersResponseSchema,
		},
	},
};
