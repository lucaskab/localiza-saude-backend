import type {
	CancellationPenaltyType,
	healthcare_provider_faq,
	professional_council,
	procedure,
	procedure_checklist_item,
	user,
} from "../../../../prisma/generated/prisma/client";
import type { ServiceModality } from "@/schemas/service-modalities";

export type HealthcareProviderFaqData = {
	question: string;
	answer: string;
};

export type CreateHealthcareProviderData = {
	userId: string;
	displayName?: string | null;
	document?: string | null;
	birthDate?: Date | null;
	gender?: string | null;
	languages?: string[];
	specialty?: string | null;
	professionalCategory?: string | null;
	professionalId?: string | null;
	professionalCouncilId?: string | null;
	licenseState?: string | null;
	licenseDocumentKey?: string | null;
	licenseDocumentFileName?: string | null;
	licenseDocumentMimeType?: string | null;
	licenseDocumentSize?: number | null;
	licenseDocumentSha256?: string | null;
	licenseDocumentUploadedAt?: Date | null;
	verificationStatus?: string;
	verificationRejectionReason?: string | null;
	verifiedAt?: Date | null;
	verifiedByUserId?: string | null;
	bio?: string | null;
	approach?: string | null;
	education?: string | null;
	certifications?: string | null;
	yearsOfExperience?: number | null;
	targetAudiences?: string[];
	serviceModalities?: ServiceModality[];
	clinicAddress?: string | null;
	clinicLatitude?: number | null;
	clinicLongitude?: number | null;
	clinicNeighborhood?: string | null;
	clinicCity?: string | null;
	clinicState?: string | null;
	homeCareRadiusKm?: number | null;
	acceptedInsurance?: string[];
	paymentMethods?: string[];
	bookingAvailabilityDays?: number | null;
	cancellationPolicy?: string | null;
	cancellationPolicyEnabled?: boolean;
	cancellationPolicyHoursBefore?: number | null;
	cancellationPolicyPenaltyType?: CancellationPenaltyType | null;
	cancellationPolicyFixedFeeCents?: number | null;
	cancellationPolicyPercentage?: number | null;
	cancellationPolicyRequiresJustification?: boolean;
	clinicPhotos?: string[];
	termsAcceptedAt?: Date | null;
	lgpdConsentAt?: Date | null;
	professionalResponsibilityAcceptedAt?: Date | null;
	faqs?: HealthcareProviderFaqData[];
};

export type UpdateHealthcareProviderData = {
	displayName?: string | null;
	document?: string | null;
	birthDate?: Date | null;
	gender?: string | null;
	languages?: string[];
	specialty?: string | null;
	professionalCategory?: string | null;
	professionalId?: string | null;
	professionalCouncilId?: string | null;
	licenseState?: string | null;
	licenseDocumentKey?: string | null;
	licenseDocumentFileName?: string | null;
	licenseDocumentMimeType?: string | null;
	licenseDocumentSize?: number | null;
	licenseDocumentSha256?: string | null;
	licenseDocumentUploadedAt?: Date | null;
	verificationStatus?: string;
	verificationRejectionReason?: string | null;
	verifiedAt?: Date | null;
	verifiedByUserId?: string | null;
	bio?: string | null;
	approach?: string | null;
	education?: string | null;
	certifications?: string | null;
	yearsOfExperience?: number | null;
	targetAudiences?: string[];
	serviceModalities?: ServiceModality[];
	clinicAddress?: string | null;
	clinicLatitude?: number | null;
	clinicLongitude?: number | null;
	clinicNeighborhood?: string | null;
	clinicCity?: string | null;
	clinicState?: string | null;
	homeCareRadiusKm?: number | null;
	acceptedInsurance?: string[];
	paymentMethods?: string[];
	bookingAvailabilityDays?: number | null;
	cancellationPolicy?: string | null;
	cancellationPolicyEnabled?: boolean;
	cancellationPolicyHoursBefore?: number | null;
	cancellationPolicyPenaltyType?: CancellationPenaltyType | null;
	cancellationPolicyFixedFeeCents?: number | null;
	cancellationPolicyPercentage?: number | null;
	cancellationPolicyRequiresJustification?: boolean;
	clinicPhotos?: string[];
	termsAcceptedAt?: Date | null;
	lgpdConsentAt?: Date | null;
	professionalResponsibilityAcceptedAt?: Date | null;
	faqs?: HealthcareProviderFaqData[];
};

export type HealthcareProviderWithRelations = user & {
	procedures: (procedure & { checklistItems: procedure_checklist_item[] })[];
	faqs: healthcare_provider_faq[];
	professionalCouncil: professional_council | null;
	distanceInKm?: number | null;
};

export type FindAllHealthcareProviderFilters = {
	search?: string;
	specialty?: string;
	serviceModality?: ServiceModality;
	language?: string;
	insurance?: string;
	verified?: boolean;
	maxPriceCents?: number;
	city?: string;
	neighborhood?: string;
	latitude?: number;
	longitude?: number;
	radiusInKm?: number;
};

export type HealthcareProviderRepository = {
	findAll: (
		filters?: FindAllHealthcareProviderFilters,
	) => Promise<HealthcareProviderWithRelations[]>;
	findById: (id: string) => Promise<HealthcareProviderWithRelations | null>;
	findByUserId: (
		userId: string,
	) => Promise<HealthcareProviderWithRelations | null>;
	create: (
		data: CreateHealthcareProviderData,
	) => Promise<HealthcareProviderWithRelations>;
	update: (
		id: string,
		data: UpdateHealthcareProviderData,
	) => Promise<HealthcareProviderWithRelations>;
	delete: (id: string) => Promise<void>;
};
