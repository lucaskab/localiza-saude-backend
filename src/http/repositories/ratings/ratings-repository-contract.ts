import type {
	customer,
	healthcare_provider,
	rating,
	user,
} from "../../../../prisma/generated/prisma/client";

export type CreateRatingData = {
	customerId: string;
	healthcareProviderId: string;
	rating: number;
	comment?: string | null;
};

export type UpdateRatingData = {
	rating?: number;
	comment?: string | null;
};

export type RatingWithRelations = rating & {
	customer: customer & {
		user: user;
	};
	healthcareProvider: healthcare_provider & {
		user: user;
	};
};

export type RatingStats = {
	averageRating: number;
	totalRatings: number;
};

export type RatingRepository = {
	findAll: () => Promise<RatingWithRelations[]>;
	findById: (id: string) => Promise<RatingWithRelations | null>;
	findByCustomerId: (customerId: string) => Promise<RatingWithRelations[]>;
	findByHealthcareProviderId: (
		healthcareProviderId: string,
	) => Promise<RatingWithRelations[]>;
	findByCustomerAndProvider: (
		customerId: string,
		healthcareProviderId: string,
	) => Promise<RatingWithRelations | null>;
	getProviderStats: (healthcareProviderId: string) => Promise<RatingStats>;
	create: (data: CreateRatingData) => Promise<RatingWithRelations>;
	update: (id: string, data: UpdateRatingData) => Promise<RatingWithRelations>;
	delete: (id: string) => Promise<void>;
};
