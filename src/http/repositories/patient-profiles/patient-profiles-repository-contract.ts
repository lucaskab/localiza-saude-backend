import type { patient_profile } from "../../../../prisma/generated/prisma/client";

export type PatientProfileData = {
	fullName: string;
	dateOfBirth?: Date | null;
	cpf?: string | null;
	phone?: string | null;
	email?: string | null;
	address?: string | null;
	gender?: string | null;
	relationshipToCustomer?: string | null;
	notes?: string | null;
	customerOwnerId?: string | null;
	createdByHealthcareProviderId?: string | null;
	bloodType?: string | null;
	medications?: string | null;
	chronicPain?: string | null;
	preExistingConditions?: string | null;
	allergies?: string | null;
	surgeries?: string | null;
	familyHistory?: string | null;
	lifestyleNotes?: string | null;
	emergencyContactName?: string | null;
	emergencyContactPhone?: string | null;
};

export type PatientProfileRepository = {
	findById: (id: string) => Promise<patient_profile | null>;
	findByCustomerOwnerId: (customerId: string) => Promise<patient_profile[]>;
	findByHealthcareProviderId: (
		healthcareProviderId: string,
	) => Promise<patient_profile[]>;
	create: (data: PatientProfileData) => Promise<patient_profile>;
};
