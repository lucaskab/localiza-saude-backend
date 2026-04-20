import type {
	healthcare_provider,
	procedure,
	user,
} from "../../../../prisma/generated/prisma/client";

export type CreateHealthcareProviderData = {
	userId: string;
	specialty?: string | null;
	professionalId?: string | null;
	bio?: string | null;
};

export type UpdateHealthcareProviderData = {
	specialty?: string | null;
	professionalId?: string | null;
	bio?: string | null;
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
