import { prisma } from "@/database/prisma";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

type AddFavoriteData = {
	customerId: string;
	healthcareProviderId: string;
};

export const addFavoriteUseCase = {
	async execute({ customerId, healthcareProviderId }: AddFavoriteData) {
		const provider = await prisma.healthcare_provider.findUnique({
			where: { id: healthcareProviderId },
			select: { id: true },
		});

		if (!provider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		await prisma.$executeRaw`
			INSERT INTO customer_favorite_providers (customer_id, healthcare_provider_id)
			VALUES (${customerId}, ${healthcareProviderId})
			ON CONFLICT (customer_id, healthcare_provider_id) DO NOTHING
		`;

		return {
			favorite: {
				customerId,
				healthcareProviderId,
			},
		};
	},
};
