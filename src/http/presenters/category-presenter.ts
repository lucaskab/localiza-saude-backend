import type {
	category,
	healthcare_provider,
	healthcare_provider_category,
	procedure,
	user,
} from "../../../prisma/generated/prisma/client";

type CategoryWithProviders = category & {
	healthcareProviderCategories: (healthcare_provider_category & {
		healthcareProvider: healthcare_provider & {
			user: user;
			procedures: procedure[];
		};
	})[];
};

function getStartingPriceCents(provider: healthcare_provider & { procedures: procedure[] }) {
	if (provider.procedures.length === 0) {
		return null;
	}

	return Math.min(...provider.procedures.map((procedure) => procedure.priceInCents));
}

export const categoryPresenter = {
	toHTTP(
		category: CategoryWithProviders,
		nextAvailableByProviderId?: Map<string, Date | null>,
		ratingSummariesByProviderId?: Map<
			string,
			{ averageRating: number; totalRatings: number }
		>,
	) {
		return {
			id: category.id,
			name: category.name,
			description: category.description,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
			healthcareProviders: category.healthcareProviderCategories.map((hpc) => ({
				id: hpc.healthcareProvider.id,
				userId: hpc.healthcareProvider.userId,
				displayName: hpc.healthcareProvider.displayName,
				languages: hpc.healthcareProvider.languages,
				specialty: hpc.healthcareProvider.specialty,
				professionalCategory: hpc.healthcareProvider.professionalCategory,
				professionalId: hpc.healthcareProvider.professionalId,
				licenseCouncil: hpc.healthcareProvider.licenseCouncil,
				licenseState: hpc.healthcareProvider.licenseState,
				verificationStatus: hpc.healthcareProvider.verificationStatus,
				bio: hpc.healthcareProvider.bio,
				serviceModalities: hpc.healthcareProvider.serviceModalities,
				clinicAddress: hpc.healthcareProvider.clinicAddress,
				nextAvailableAt:
					nextAvailableByProviderId?.get(hpc.healthcareProvider.id) ?? null,
				startingPriceCents: getStartingPriceCents(hpc.healthcareProvider),
				averageRating:
					ratingSummariesByProviderId?.get(hpc.healthcareProvider.id)
						?.averageRating ?? 0,
				totalRatings:
					ratingSummariesByProviderId?.get(hpc.healthcareProvider.id)
						?.totalRatings ?? 0,
				user: {
					id: hpc.healthcareProvider.user.id,
					name: hpc.healthcareProvider.user.name,
					firstName: hpc.healthcareProvider.user.firstName,
					lastName: hpc.healthcareProvider.user.lastName,
					email: hpc.healthcareProvider.user.email,
					phone: hpc.healthcareProvider.user.phone,
					image: hpc.healthcareProvider.user.image,
				},
			})),
		};
	},

	toHTTPMany(
		categories: CategoryWithProviders[],
		nextAvailableByProviderId?: Map<string, Date | null>,
		ratingSummariesByProviderId?: Map<
			string,
			{ averageRating: number; totalRatings: number }
		>,
	) {
		return categories.map((category) =>
			this.toHTTP(
				category,
				nextAvailableByProviderId,
				ratingSummariesByProviderId,
			),
		);
	},
};
