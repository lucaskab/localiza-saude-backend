import type {
	category,
	healthcare_provider_category,
	professional_council,
	procedure,
	user,
} from "../../../prisma/generated/prisma/client";

type CategoryWithHealthcareProviders = category & {
	healthcareProviderCategories: (healthcare_provider_category & {
		healthcareProvider: user & {
			procedures: procedure[];
			professionalCouncil: professional_council | null;
		};
	})[];
};

function getStartingPriceCents(
	healthcareProvider: user & { procedures: procedure[] },
) {
	if (healthcareProvider.procedures.length === 0) {
		return null;
	}

	return Math.min(
		...healthcareProvider.procedures.map(
			(procedure) => procedure.priceInCents,
		),
	);
}

export const categoryPresenter = {
	toHTTP(
		category: CategoryWithHealthcareProviders,
		nextAvailableByHealthcareProviderId?: Map<string, Date | null>,
		ratingSummariesByHealthcareProviderId?: Map<
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
				displayName: hpc.healthcareProvider.displayName,
				languages: hpc.healthcareProvider.languages,
				specialty: hpc.healthcareProvider.specialty,
				professionalCategory: hpc.healthcareProvider.professionalCategory,
				professionalId: hpc.healthcareProvider.professionalId,
				professionalCouncilId: hpc.healthcareProvider.professionalCouncilId,
				professionalCouncil: hpc.healthcareProvider.professionalCouncil,
				licenseState: hpc.healthcareProvider.licenseState,
				verificationStatus: hpc.healthcareProvider.verificationStatus,
				bio: hpc.healthcareProvider.bio,
				serviceModalities: hpc.healthcareProvider.serviceModalities,
				clinicAddress: hpc.healthcareProvider.clinicAddress,
				nextAvailableAt:
					nextAvailableByHealthcareProviderId?.get(hpc.healthcareProvider.id) ?? null,
				startingPriceCents: getStartingPriceCents(hpc.healthcareProvider),
				averageRating:
					ratingSummariesByHealthcareProviderId?.get(hpc.healthcareProvider.id)
						?.averageRating ?? 0,
				totalRatings:
					ratingSummariesByHealthcareProviderId?.get(hpc.healthcareProvider.id)
						?.totalRatings ?? 0,
				name: hpc.healthcareProvider.name,
				firstName: hpc.healthcareProvider.firstName,
				lastName: hpc.healthcareProvider.lastName,
				email: hpc.healthcareProvider.email,
				phone: hpc.healthcareProvider.phone,
				image: hpc.healthcareProvider.image,
			})),
		};
	},

	toHTTPMany(
		categories: CategoryWithHealthcareProviders[],
		nextAvailableByHealthcareProviderId?: Map<string, Date | null>,
		ratingSummariesByHealthcareProviderId?: Map<
			string,
			{ averageRating: number; totalRatings: number }
		>,
	) {
		return categories.map((category) =>
			this.toHTTP(
				category,
				nextAvailableByHealthcareProviderId,
				ratingSummariesByHealthcareProviderId,
			),
		);
	},
};
