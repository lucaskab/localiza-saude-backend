import { prismaFavoriteRepository } from "@/http/repositories/favorites/favorites-repository-implementation";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

type AddFavoriteData = {
	customerId: string;
	healthcareProviderId: string;
};

export const addFavoriteUseCase = {
	async execute({ customerId, healthcareProviderId }: AddFavoriteData) {
		const provider =
			await prismaHealthcareProviderRepository.findById(healthcareProviderId);

		if (!provider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		const favorite = await prismaFavoriteRepository.add(
			customerId,
			healthcareProviderId,
		);

		return {
			favorite: {
				customerId: favorite.customerId,
				healthcareProviderId: favorite.healthcareProviderId,
			},
		};
	},
};
