import { prisma } from "@/database/prisma";
import type {
	CategoryRepository,
	CreateCategoryData,
	UpdateCategoryData,
} from "./categories-repository-contract";

export const prismaCategoryRepository: CategoryRepository = {
	async findAll() {
		const categories = await prisma.category.findMany({
			orderBy: {
				name: "asc",
			},
			include: {
				healthcareProviderCategories: {
					include: {
						healthcareProvider: {
							include: {
								user: true,
							},
						},
					},
				},
			},
		});

		return categories;
	},

	async findById(id: string) {
		const category = await prisma.category.findUnique({
			where: { id },
			include: {
				healthcareProviderCategories: {
					include: {
						healthcareProvider: {
							include: {
								user: true,
							},
						},
					},
				},
			},
		});

		return category;
	},

	async findByName(name: string) {
		const category = await prisma.category.findUnique({
			where: { name },
		});

		return category;
	},

	async create(data: CreateCategoryData) {
		const category = await prisma.category.create({
			data: {
				name: data.name,
				description: data.description,
			},
			include: {
				healthcareProviderCategories: {
					include: {
						healthcareProvider: {
							include: {
								user: true,
							},
						},
					},
				},
			},
		});

		return category;
	},

	async update(id: string, data: UpdateCategoryData) {
		const category = await prisma.category.update({
			where: { id },
			data: {
				...(data.name && { name: data.name }),
				...(data.description !== undefined && {
					description: data.description,
				}),
			},
			include: {
				healthcareProviderCategories: {
					include: {
						healthcareProvider: {
							include: {
								user: true,
							},
						},
					},
				},
			},
		});

		return category;
	},

	async delete(id: string) {
		await prisma.category.delete({
			where: { id },
		});
	},
};
