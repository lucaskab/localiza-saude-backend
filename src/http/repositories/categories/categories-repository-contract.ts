import type {
	category,
	user,
	healthcare_provider_category,
	procedure,
} from "../../../../prisma/generated/prisma/client";

export type CategoryWithProfessionals = category & {
	healthcareProviderCategories: (healthcare_provider_category & {
		healthcareProvider: user & { procedures: procedure[] };
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
