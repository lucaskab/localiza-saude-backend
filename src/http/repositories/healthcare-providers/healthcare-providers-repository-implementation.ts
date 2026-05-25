import { prisma } from "@/database/prisma";
import type {
	CreateHealthcareProviderData,
	FindAllHealthcareProviderFilters,
	HealthcareProviderRepository,
	UpdateHealthcareProviderData,
} from "./healthcare-providers-repository-contract";
import { augmentHealthcareProviderSearchWhere } from "@/http/repositories/addresses/address-search";
import { attachPrimaryAddressesToOwners } from "@/http/useCases/addresses/attach-primary-addresses";
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
			const baseWhere = createFindAllWhere(filters);
			const where = await augmentHealthcareProviderSearchWhere(
				filters,
				baseWhere,
			);
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
			let healthcareProviders = await attachPrimaryAddressesToOwners(
				"USER",
				healthcareProvidersResult.map(toHealthcareProvider),
				"CLINIC",
			);

			if (
				typeof filters?.latitude === "number" &&
				typeof filters.longitude === "number"
			) {
				const radiusInKm = filters.radiusInKm ?? 25;

				healthcareProviders = healthcareProviders
					.map((provider) => ({
						...provider,
						distanceInKm:
							typeof provider.primaryAddress?.latitude === "number" &&
							typeof provider.primaryAddress?.longitude === "number"
								? calculateDistanceInKm({
										fromLatitude: filters.latitude as number,
										fromLongitude: filters.longitude as number,
										toLatitude: provider.primaryAddress.latitude,
										toLongitude: provider.primaryAddress.longitude,
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

			if (!healthcareProvider) {
				return null;
			}

			const [withAddress] = await attachPrimaryAddressesToOwners(
				"USER",
				[toHealthcareProvider(healthcareProvider)],
				"CLINIC",
			);

			return withAddress;
		},

		async findByUserId(userId: string) {
			const healthcareProvider = await prisma.user.findUnique({
				where: { id: userId, role: "HEALTHCARE_PROVIDER" },
				include: healthcareProviderInclude,
			});

			if (!healthcareProvider) {
				return null;
			}

			const [withAddress] = await attachPrimaryAddressesToOwners(
				"USER",
				[toHealthcareProvider(healthcareProvider)],
				"CLINIC",
			);

			return withAddress;
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
