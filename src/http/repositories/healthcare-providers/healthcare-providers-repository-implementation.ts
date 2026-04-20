import { prisma } from "@/database/prisma";
import type {
	CreateHealthcareProviderData,
	HealthcareProviderRepository,
	HealthcareProviderWithRelations,
	UpdateHealthcareProviderData,
} from "./healthcare-providers-repository-contract";

export const prismaHealthcareProviderRepository: HealthcareProviderRepository =
	{
		async findAll() {
			const providers = await prisma.healthcare_provider.findMany({
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
					procedures: {
						orderBy: {
							createdAt: "desc",
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			return providers as HealthcareProviderWithRelations[];
		},

		async findById(id: string) {
			const provider = await prisma.healthcare_provider.findUnique({
				where: { id },
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
					procedures: {
						orderBy: {
							createdAt: "desc",
						},
					},
				},
			});

			return provider as HealthcareProviderWithRelations | null;
		},

		async findByUserId(userId: string) {
			const provider = await prisma.healthcare_provider.findUnique({
				where: { userId },
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
					procedures: {
						orderBy: {
							createdAt: "desc",
						},
					},
				},
			});

			return provider as HealthcareProviderWithRelations | null;
		},

		async create(data: CreateHealthcareProviderData) {
			const provider = await prisma.healthcare_provider.create({
				data: {
					userId: data.userId,
					specialty: data.specialty,
					professionalId: data.professionalId,
					bio: data.bio,
				},
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
					procedures: true,
				},
			});

			return provider as HealthcareProviderWithRelations;
		},

		async update(id: string, data: UpdateHealthcareProviderData) {
			const provider = await prisma.healthcare_provider.update({
				where: { id },
				data: {
					...(data.specialty !== undefined && { specialty: data.specialty }),
					...(data.professionalId !== undefined && {
						professionalId: data.professionalId,
					}),
					...(data.bio !== undefined && { bio: data.bio }),
				},
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
					procedures: {
						orderBy: {
							createdAt: "desc",
						},
					},
				},
			});

			return provider as HealthcareProviderWithRelations;
		},

		async delete(id: string) {
			await prisma.healthcare_provider.delete({
				where: { id },
			});
		},
	};
