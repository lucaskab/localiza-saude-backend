import type {
	customer_favorite_provider,
} from "../../../../prisma/generated/prisma/client";
import type { HealthcareProviderWithRelations } from "../healthcare-providers/healthcare-providers-repository-contract";

export type FavoriteProviderWithRelations = customer_favorite_provider & {
	healthcareProvider: HealthcareProviderWithRelations;
};

export type FavoriteRepository = {
	findByUserId: (
		userId: string,
	) => Promise<FavoriteProviderWithRelations[]>;
	add: (
		userId: string,
		healthcareProviderId: string,
	) => Promise<customer_favorite_provider>;
	remove: (
		userId: string,
		healthcareProviderId: string,
	) => Promise<void>;
};
