import { prisma } from "@/database/prisma";
import type {
	FavoriteProviderWithRelations,
	FavoriteRepository,
} from "./favorites-repository-contract";

const includeHealthcareProviderRelations = {
	healthcareProvider: {
		include: {
			user: {
				select: {
					id: true,
					name: true,
					firstName: true,
					lastName: true,
					email: true,
					emailVerified: true,
					phone: true,
					image: true,
					role: true,
					createdAt: true,
					updatedAt: true,
				},
			},
			procedures: {
				orderBy: {
					createdAt: "desc" as const,
				},
			},
		},
	},
};

export const prismaFavoriteRepository: FavoriteRepository = {
	async findByCustomerId(customerId: string) {
		const favorites = await prisma.customer_favorite_provider.findMany({
			where: { customerId },
			include: includeHealthcareProviderRelations,
			orderBy: {
				createdAt: "desc",
			},
		});

		return favorites as FavoriteProviderWithRelations[];
	},

	async add(customerId: string, healthcareProviderId: string) {
		const favorite = await prisma.customer_favorite_provider.upsert({
			where: {
				customerId_healthcareProviderId: {
					customerId,
					healthcareProviderId,
				},
			},
			create: {
				customerId,
				healthcareProviderId,
			},
			update: {},
		});

		return favorite;
	},

	async remove(customerId: string, healthcareProviderId: string) {
		await prisma.customer_favorite_provider.deleteMany({
			where: {
				customerId,
				healthcareProviderId,
			},
		});
	},
};
