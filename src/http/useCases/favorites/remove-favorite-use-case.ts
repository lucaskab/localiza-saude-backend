import { prismaFavoriteRepository } from "@/http/repositories/favorites/favorites-repository-implementation";

type RemoveFavoriteData = {
	customerId: string;
	healthcareProviderId: string;
};

export const removeFavoriteUseCase = {
	async execute({ customerId, healthcareProviderId }: RemoveFavoriteData) {
		await prismaFavoriteRepository.remove(customerId, healthcareProviderId);

		return {
			message: "Favorite removed successfully",
		};
	},
};
