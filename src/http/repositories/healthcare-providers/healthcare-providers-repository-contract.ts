import type {
	healthcare_provider_faq,
	procedure,
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
	licenseCouncil?: string | null;
	licenseState?: string | null;
	licenseDocumentKey?: string | null;
	licenseDocumentFileName?: string | null;
	licenseDocumentMimeType?: string | null;
	licenseDocumentSize?: number | null;
	licenseDocumentSha256?: string | null;
	licenseDocumentUploadedAt?: Date | null;
	verificationStatus?: string;
	verifiedAt?: Date | null;
	bio?: string | null;
	approach?: string | null;
	education?: string | null;
	certifications?: string | null;
	yearsOfExperience?: number | null;
	targetAudiences?: string[];
	serviceModalities?: ServiceModality[];
	clinicAddress?: string | null;
	homeCareRadiusKm?: number | null;
	acceptedInsurance?: string[];
	paymentMethods?: string[];
	cancellationPolicy?: string | null;
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
	licenseCouncil?: string | null;
	licenseState?: string | null;
	licenseDocumentKey?: string | null;
	licenseDocumentFileName?: string | null;
	licenseDocumentMimeType?: string | null;
	licenseDocumentSize?: number | null;
	licenseDocumentSha256?: string | null;
	licenseDocumentUploadedAt?: Date | null;
	verificationStatus?: string;
	verifiedAt?: Date | null;
	bio?: string | null;
	approach?: string | null;
	education?: string | null;
	certifications?: string | null;
	yearsOfExperience?: number | null;
	targetAudiences?: string[];
	serviceModalities?: ServiceModality[];
	clinicAddress?: string | null;
	homeCareRadiusKm?: number | null;
	acceptedInsurance?: string[];
	paymentMethods?: string[];
	cancellationPolicy?: string | null;
	clinicPhotos?: string[];
	termsAcceptedAt?: Date | null;
	lgpdConsentAt?: Date | null;
	professionalResponsibilityAcceptedAt?: Date | null;
	faqs?: HealthcareProviderFaqData[];
};

export type HealthcareProviderWithRelations = user & {
	procedures: procedure[];
	faqs: healthcare_provider_faq[];
};

export type FindAllHealthcareProviderFilters = {
	search?: string;
	specialty?: string;
	serviceModality?: ServiceModality;
	language?: string;
	insurance?: string;
	verified?: boolean;
	maxPriceCents?: number;
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
