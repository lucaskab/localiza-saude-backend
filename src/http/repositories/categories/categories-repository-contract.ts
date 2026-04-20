import type {
	category,
	healthcare_provider,
	healthcare_provider_category,
	user,
} from "../../../../prisma/generated/prisma/client";

export type CategoryWithProviders = category & {
	healthcareProviderCategories: (healthcare_provider_category & {
		healthcareProvider: healthcare_provider & {
			user: user;
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
	findAll: () => Promise<CategoryWithProviders[]>;
	findById: (id: string) => Promise<CategoryWithProviders | null>;
	findByName: (name: string) => Promise<category | null>;
	create: (data: CreateCategoryData) => Promise<CategoryWithProviders>;
	update: (
		id: string,
		data: UpdateCategoryData,
	) => Promise<CategoryWithProviders>;
	delete: (id: string) => Promise<void>;
};
