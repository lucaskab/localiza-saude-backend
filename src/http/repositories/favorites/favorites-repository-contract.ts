import type {
	customer_favorite_provider,
} from "../../../../prisma/generated/prisma/client";
import type { HealthcareProviderWithRelations } from "../healthcare-providers/healthcare-providers-repository-contract";

export type FavoriteProviderWithRelations = customer_favorite_provider & {
	healthcareProvider: HealthcareProviderWithRelations;
};

export type FavoriteRepository = {
	findByCustomerId: (
		customerId: string,
	) => Promise<FavoriteProviderWithRelations[]>;
	add: (
		customerId: string,
		healthcareProviderId: string,
	) => Promise<customer_favorite_provider>;
	remove: (
		customerId: string,
		healthcareProviderId: string,
	) => Promise<void>;
};
