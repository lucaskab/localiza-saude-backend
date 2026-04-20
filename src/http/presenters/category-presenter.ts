import type {
	category,
	healthcare_provider,
	healthcare_provider_category,
	user,
} from "../../../prisma/generated/prisma/client";

type CategoryWithProviders = category & {
	healthcareProviderCategories: (healthcare_provider_category & {
		healthcareProvider: healthcare_provider & {
			user: user;
		};
	})[];
};

export const categoryPresenter = {
	toHTTP(category: CategoryWithProviders) {
		return {
			id: category.id,
			name: category.name,
			description: category.description,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
			healthcareProviders: category.healthcareProviderCategories.map((hpc) => ({
				id: hpc.healthcareProvider.id,
				userId: hpc.healthcareProvider.userId,
				specialty: hpc.healthcareProvider.specialty,
				professionalId: hpc.healthcareProvider.professionalId,
				bio: hpc.healthcareProvider.bio,
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

	toHTTPMany(categories: CategoryWithProviders[]) {
		return categories.map((category) => this.toHTTP(category));
	},
};
