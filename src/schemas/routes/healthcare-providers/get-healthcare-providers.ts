import { z } from "zod";
import { procedureSchema } from "../procedures/get-procedures";

const userSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	email: z.email(),
	phone: z.string().nullable().optional(),
	image: z.string().nullable().optional(),
	role: z.enum(["HEALTHCARE_PROVIDER", "CUSTOMER"]),
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
	nextAvailableAt: z.date().nullable().optional(),
	startingPriceCents: z.number().int().nullable().optional(),
	averageRating: z.number().optional(),
	totalRatings: z.number().int().optional(),
	procedures: z.array(procedureSchema),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const getHealthcareProvidersResponseSchema = z.object({
	healthcareProviders: z.array(healthcareProviderSchema),
});

export type GetHealthcareProvidersResponseSchema = z.infer<
	typeof getHealthcareProvidersResponseSchema
>;

export const getHealthcareProvidersRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Get all healthcare providers",
		response: {
			200: getHealthcareProvidersResponseSchema,
		},
	},
};
