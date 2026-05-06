import type {
	healthcare_provider,
	procedure,
	user,
} from "../../../../prisma/generated/prisma/client";

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
	serviceModalities?: string[];
	clinicAddress?: string | null;
	homeCareRadiusKm?: number | null;
	acceptedInsurance?: string[];
	paymentMethods?: string[];
	cancellationPolicy?: string | null;
	clinicPhotos?: string[];
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
	serviceModalities?: string[];
	clinicAddress?: string | null;
	homeCareRadiusKm?: number | null;
	acceptedInsurance?: string[];
	paymentMethods?: string[];
	cancellationPolicy?: string | null;
	clinicPhotos?: string[];
};

export type HealthcareProviderWithRelations = healthcare_provider & {
	user: user;
	procedures: procedure[];
};

export type HealthcareProviderRepository = {
	findAll: () => Promise<HealthcareProviderWithRelations[]>;
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
