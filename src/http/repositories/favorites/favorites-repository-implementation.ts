import { prisma } from "@/database/prisma";
import type {
	FavoriteProviderWithRelations,
	FavoriteRepository,
} from "./favorites-repository-contract";

const includeHealthcareProviderRelations = {
	healthcareProvider: {
		include: {
			procedures: {
				orderBy: {
					createdAt: "desc" as const,
				},
			},
		},
	},
};

export const prismaFavoriteRepository: FavoriteRepository = {
	async findByUserId(userId: string) {
		const favorites = await prisma.customer_favorite_provider.findMany({
			where: { customerId: userId },
			include: includeHealthcareProviderRelations,
			orderBy: {
				createdAt: "desc",
			},
		});

		return favorites as FavoriteProviderWithRelations[];
	},

	async add(userId: string, healthcareProviderId: string) {
		const favorite = await prisma.customer_favorite_provider.upsert({
			where: {
				customerId_healthcareProviderId: {
					customerId: userId,
					healthcareProviderId,
				},
			},
			create: {
				customerId: userId,
				healthcareProviderId,
			},
			update: {},
		});

		return favorite;
	},

	async remove(userId: string, healthcareProviderId: string) {
		await prisma.customer_favorite_provider.deleteMany({
			where: {
				customerId: userId,
				healthcareProviderId,
			},
		});
	},
};
