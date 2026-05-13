import { z } from "zod";
import { serviceModalitySchema } from "@/schemas/service-modalities";
import { procedureSchema } from "../procedures/get-procedures";

export const userRoleSchema = z.enum([
	"CUSTOMER",
	"HEALTHCARE_PROVIDER",
	"ADMIN",
	"STAFF",
]);

export const publicUserSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	firstName: z.string().nullable().optional(),
	lastName: z.string().nullable().optional(),
	email: z.email().optional(),
	emailVerified: z.boolean().optional(),
	phone: z.string().nullable().optional(),
	image: z.string().nullable().optional(),
	role: userRoleSchema.optional(),
	onboardingCompleted: z.boolean().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export const customerUserSchema = publicUserSchema.extend({
	role: z.literal("CUSTOMER").optional(),
	cpf: z.string().nullable().optional(),
	dateOfBirth: z.date().nullable().optional(),
	address: z.string().nullable().optional(),
});

export const staffUserSchema = publicUserSchema.extend({
	role: z.literal("STAFF").optional(),
});

export const professionalFaqSchema = z.object({
	id: z.cuid(),
	healthcareProviderId: z.cuid(),
	question: z.string(),
	answer: z.string(),
	position: z.number().int(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const professionalCouncilSchema = z.object({
	id: z.string(),
	acronym: z.string(),
	name: z.string(),
	profession: z.string(),
	allowsPriceDisplay: z.boolean(),
	priceDisplayNote: z.string().nullable().optional(),
	active: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const healthcareProviderUserSchema = publicUserSchema.extend({
	role: z.literal("HEALTHCARE_PROVIDER").optional(),
	displayName: z.string().nullable().optional(),
	document: z.string().nullable().optional(),
	birthDate: z.date().nullable().optional(),
	gender: z.string().nullable().optional(),
	languages: z.array(z.string()).optional(),
	specialty: z.string().nullable().optional(),
	professionalCategory: z.string().nullable().optional(),
	professionalId: z.string().nullable().optional(),
	professionalCouncilId: z.string().nullable().optional(),
	professionalCouncil: professionalCouncilSchema.nullable().optional(),
	licenseState: z.string().nullable().optional(),
	licenseDocumentFileName: z.string().nullable().optional(),
	licenseDocumentMimeType: z.string().nullable().optional(),
	licenseDocumentSize: z.number().int().nullable().optional(),
	licenseDocumentSha256: z.string().nullable().optional(),
	licenseDocumentUploadedAt: z.date().nullable().optional(),
	verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
	verificationRejectionReason: z.string().nullable().optional(),
	verifiedAt: z.date().nullable().optional(),
	verifiedByUserId: z.string().nullable().optional(),
	bio: z.string().nullable().optional(),
	approach: z.string().nullable().optional(),
	education: z.string().nullable().optional(),
	certifications: z.string().nullable().optional(),
	yearsOfExperience: z.number().int().nullable().optional(),
	targetAudiences: z.array(z.string()).optional(),
	serviceModalities: z.array(serviceModalitySchema).optional(),
	clinicAddress: z.string().nullable().optional(),
	clinicLatitude: z.number().nullable().optional(),
	clinicLongitude: z.number().nullable().optional(),
	clinicNeighborhood: z.string().nullable().optional(),
	clinicCity: z.string().nullable().optional(),
	clinicState: z.string().nullable().optional(),
	homeCareRadiusKm: z.number().int().nullable().optional(),
	acceptedInsurance: z.array(z.string()).optional(),
	paymentMethods: z.array(z.string()).optional(),
	cancellationPolicy: z.string().nullable().optional(),
	cancellationPolicyEnabled: z.boolean().optional(),
	cancellationPolicyHoursBefore: z.number().int().nullable().optional(),
	cancellationPolicyPenaltyType: z.enum(["FIXED", "PERCENTAGE"]).nullable().optional(),
	cancellationPolicyFixedFeeCents: z.number().int().nullable().optional(),
	cancellationPolicyPercentage: z.number().int().nullable().optional(),
	cancellationPolicyRequiresJustification: z.boolean().optional(),
	clinicPhotos: z.array(z.string()).optional(),
	termsAcceptedAt: z.date().nullable().optional(),
	lgpdConsentAt: z.date().nullable().optional(),
	professionalResponsibilityAcceptedAt: z.date().nullable().optional(),
	nextAvailableAt: z.date().nullable().optional(),
	startingPriceCents: z.number().int().nullable().optional(),
	averageRating: z.number().optional(),
	totalRatings: z.number().int().optional(),
	completedAppointments: z.number().int().optional(),
	confirmationRate: z.number().optional(),
	distanceInKm: z.number().nullable().optional(),
	isSuperProfessional: z.boolean().optional(),
	procedures: z.array(procedureSchema).optional(),
	faqs: z.array(professionalFaqSchema).optional(),
});
