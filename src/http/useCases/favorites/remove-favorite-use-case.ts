import { prisma } from "@/database/prisma";

type RemoveFavoriteData = {
	customerId: string;
	healthcareProviderId: string;
};

export const removeFavoriteUseCase = {
	async execute({ customerId, healthcareProviderId }: RemoveFavoriteData) {
		await prisma.$executeRaw`
			DELETE FROM customer_favorite_providers
			WHERE customer_id = ${customerId}
				AND healthcare_provider_id = ${healthcareProviderId}
		`;

		return {
			message: "Favorite removed successfully",
		};
	},
};
