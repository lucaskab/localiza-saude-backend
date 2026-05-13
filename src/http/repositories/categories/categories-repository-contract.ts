import type {
	category,
	healthcare_provider_category,
	professional_council,
	procedure,
	user,
} from "../../../../prisma/generated/prisma/client";

export type CategoryWithProfessionals = category & {
	healthcareProviderCategories: (healthcare_provider_category & {
		healthcareProvider: user & {
			procedures: procedure[];
			professionalCouncil: professional_council | null;
		};
	})[];
};

export type CreateCategoryData = {
	name: string;
	description?: string | null;
};

export type UpdateCategoryData = {
	name?: string;
	description?: string | null;
};

export type CategoryRepository = {
	findAll: () => Promise<CategoryWithProfessionals[]>;
	findById: (id: string) => Promise<CategoryWithProfessionals | null>;
	findByName: (name: string) => Promise<category | null>;
	create: (data: CreateCategoryData) => Promise<CategoryWithProfessionals>;
	update: (
		id: string,
		data: UpdateCategoryData,
	) => Promise<CategoryWithProfessionals>;
	delete: (id: string) => Promise<void>;
};
