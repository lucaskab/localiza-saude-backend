import { prisma } from "@/database/prisma";
import type {
	CreateHealthcareProviderData,
	FindAllHealthcareProviderFilters,
	HealthcareProviderRepository,
	UpdateHealthcareProviderData,
} from "./healthcare-providers-repository-contract";
import {
	buildHealthcareProviderCreateData,
	buildHealthcareProviderUpdateData,
	calculateDistanceInKm,
	createFindAllWhere,
	healthcareProviderInclude,
	replaceHealthcareProviderFaqs,
	toHealthcareProvider,
} from "./helpers";

export const prismaHealthcareProviderRepository: HealthcareProviderRepository =
	{
		async findAll(filters) {
			const where = createFindAllWhere(filters);
			const healthcareProvidersResult = await prisma.user.findMany({
				where: {
					role: "HEALTHCARE_PROVIDER",
					...(where ? { AND: [where] } : {}),
				},
				include: healthcareProviderInclude,
				orderBy: {
					createdAt: "desc",
				},
			});
			let healthcareProviders =
				healthcareProvidersResult.map(toHealthcareProvider);

			if (
				typeof filters?.latitude === "number" &&
				typeof filters.longitude === "number"
			) {
				const radiusInKm = filters.radiusInKm ?? 25;

				healthcareProviders = healthcareProviders
					.map((provider) => ({
						...provider,
						distanceInKm:
							typeof provider.clinicLatitude === "number" &&
							typeof provider.clinicLongitude === "number"
								? calculateDistanceInKm({
										fromLatitude: filters.latitude as number,
										fromLongitude: filters.longitude as number,
										toLatitude: provider.clinicLatitude,
										toLongitude: provider.clinicLongitude,
									})
								: null,
					}))
					.filter(
						(provider) =>
							typeof provider.distanceInKm === "number" &&
							provider.distanceInKm <= radiusInKm,
					)
					.sort((a, b) => (a.distanceInKm ?? 0) - (b.distanceInKm ?? 0));
			}

			return healthcareProviders;
		},

		async findById(id: string) {
			const healthcareProvider = await prisma.user.findUnique({
				where: { id, role: "HEALTHCARE_PROVIDER" },
				include: healthcareProviderInclude,
			});

			return healthcareProvider
				? toHealthcareProvider(healthcareProvider)
				: null;
		},

		async findByUserId(userId: string) {
			const healthcareProvider = await prisma.user.findUnique({
				where: { id: userId, role: "HEALTHCARE_PROVIDER" },
				include: healthcareProviderInclude,
			});

			return healthcareProvider
				? toHealthcareProvider(healthcareProvider)
				: null;
		},

		async create(data: CreateHealthcareProviderData) {
			const healthcareProvider = await prisma.user.update({
				where: { id: data.userId },
				data: buildHealthcareProviderCreateData(data),
				include: healthcareProviderInclude,
			});

			return toHealthcareProvider(healthcareProvider);
		},

		async update(id: string, data: UpdateHealthcareProviderData) {
			const healthcareProvider = await prisma.$transaction(async (tx) => {
				const updateData = buildHealthcareProviderUpdateData(data);

				const updatedProfessional = await tx.user.update({
					where: { id },
					data: updateData,
				});

				await replaceHealthcareProviderFaqs(tx, id, data.faqs);

				return tx.user.findUniqueOrThrow({
					where: { id: updatedProfessional.id },
					include: healthcareProviderInclude,
				});
			});

			return toHealthcareProvider(healthcareProvider);
		},

		async delete(id: string) {
			await prisma.user.delete({
				where: { id },
			});
		},
	};
