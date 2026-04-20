import { prisma } from "@/database/prisma";
import type {
	CreateRatingData,
	RatingRepository,
	RatingStats,
	RatingWithRelations,
	UpdateRatingData,
} from "./ratings-repository-contract";

const includeRelations = {
	customer: {
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					phone: true,
					image: true,
					role: true,
				},
			},
		},
	},
	healthcareProvider: {
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					phone: true,
					image: true,
					role: true,
				},
			},
		},
	},
};

export const prismaRatingRepository: RatingRepository = {
	async findAll() {
		const ratings = await prisma.rating.findMany({
			include: includeRelations,
			orderBy: {
				createdAt: "desc",
			},
		});

		return ratings as RatingWithRelations[];
	},

	async findById(id: string) {
		const rating = await prisma.rating.findUnique({
			where: { id },
			include: includeRelations,
		});

		return rating as RatingWithRelations | null;
	},

	async findByCustomerId(customerId: string) {
		const ratings = await prisma.rating.findMany({
			where: { customerId },
			include: includeRelations,
			orderBy: {
				createdAt: "desc",
			},
		});

		return ratings as RatingWithRelations[];
	},

	async findByHealthcareProviderId(healthcareProviderId: string) {
		const ratings = await prisma.rating.findMany({
			where: { healthcareProviderId },
			include: includeRelations,
			orderBy: {
				createdAt: "desc",
			},
		});

		return ratings as RatingWithRelations[];
	},

	async findByCustomerAndProvider(
		customerId: string,
		healthcareProviderId: string,
	) {
		const rating = await prisma.rating.findUnique({
			where: {
				customerId_healthcareProviderId: {
					customerId,
					healthcareProviderId,
				},
			},
			include: includeRelations,
		});

		return rating as RatingWithRelations | null;
	},

	async getProviderStats(healthcareProviderId: string) {
		const result = await prisma.rating.aggregate({
			where: { healthcareProviderId },
			_avg: {
				rating: true,
			},
			_count: {
				rating: true,
			},
		});

		return {
			averageRating: result._avg.rating || 0,
			totalRatings: result._count.rating || 0,
		};
	},

	async create(data: CreateRatingData) {
		const rating = await prisma.rating.create({
			data: {
				customerId: data.customerId,
				healthcareProviderId: data.healthcareProviderId,
				rating: data.rating,
				comment: data.comment,
			},
			include: includeRelations,
		});

		return rating as RatingWithRelations;
	},

	async update(id: string, data: UpdateRatingData) {
		const rating = await prisma.rating.update({
			where: { id },
			data: {
				...(data.rating !== undefined && { rating: data.rating }),
				...(data.comment !== undefined && { comment: data.comment }),
			},
			include: includeRelations,
		});

		return rating as RatingWithRelations;
	},

	async delete(id: string) {
		await prisma.rating.delete({
			where: { id },
		});
	},
};
