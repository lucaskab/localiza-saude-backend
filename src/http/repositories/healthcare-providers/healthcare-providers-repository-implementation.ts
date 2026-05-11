import { prisma } from "@/database/prisma";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import type {
	CreateHealthcareProviderData,
	FindAllHealthcareProviderFilters,
	HealthcareProviderRepository,
	HealthcareProviderWithRelations,
	UpdateHealthcareProviderData,
} from "./healthcare-providers-repository-contract";

const healthcareProviderInclude = {
	procedures: {
		include: {
			checklistItems: {
				orderBy: {
					position: "asc",
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	},
	faqs: {
		orderBy: {
			position: "asc",
		},
	},
	clinicEmployees: {
		where: {
			active: true,
		},
		include: {
			clinic: true,
		},
		orderBy: {
			createdAt: "asc",
		},
	},
} satisfies Prisma.userInclude;

type HealthcareProviderQueryResult = Prisma.userGetPayload<{
	include: typeof healthcareProviderInclude;
}>;

function toHealthcareProvider(
	user: HealthcareProviderQueryResult,
): HealthcareProviderWithRelations {
	const { clinicEmployees, procedures, faqs, ...profile } = user;
	const primaryClinic =
		clinicEmployees.find((employee) => employee.role === "OWNER")?.clinic ??
		clinicEmployees[0]?.clinic;

	return {
		...profile,
		clinicAddress: profile.clinicAddress ?? primaryClinic?.address ?? null,
		clinicLatitude: profile.clinicLatitude ?? primaryClinic?.latitude ?? null,
		clinicLongitude:
			profile.clinicLongitude ?? primaryClinic?.longitude ?? null,
		procedures: procedures,
		faqs: faqs,
	};
}

function calculateDistanceInKm(params: {
	fromLatitude: number;
	fromLongitude: number;
	toLatitude: number;
	toLongitude: number;
}) {
	const earthRadiusInKm = 6371;
	const latitudeDistance =
		((params.toLatitude - params.fromLatitude) * Math.PI) / 180;
	const longitudeDistance =
		((params.toLongitude - params.fromLongitude) * Math.PI) / 180;
	const fromLatitudeRadians = (params.fromLatitude * Math.PI) / 180;
	const toLatitudeRadians = (params.toLatitude * Math.PI) / 180;
	const haversine =
		Math.sin(latitudeDistance / 2) * Math.sin(latitudeDistance / 2) +
		Math.cos(fromLatitudeRadians) *
			Math.cos(toLatitudeRadians) *
			Math.sin(longitudeDistance / 2) *
			Math.sin(longitudeDistance / 2);

	return (
		earthRadiusInKm *
		2 *
		Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
	);
}

function calculateCoordinateBounds(params: {
	latitude: number;
	longitude: number;
	radiusInKm: number;
}) {
	const latitudeDelta = params.radiusInKm / 111;
	const latitudeRadians = (params.latitude * Math.PI) / 180;
	const longitudeDelta =
		params.radiusInKm / (111 * Math.max(Math.cos(latitudeRadians), 0.01));

	return {
		minLatitude: Math.max(params.latitude - latitudeDelta, -90),
		maxLatitude: Math.min(params.latitude + latitudeDelta, 90),
		minLongitude: Math.max(params.longitude - longitudeDelta, -180),
		maxLongitude: Math.min(params.longitude + longitudeDelta, 180),
	};
}

function createFindAllWhere(filters?: FindAllHealthcareProviderFilters) {
	if (!filters) {
		return undefined;
	}

	const search = filters.search?.trim();
	const specialty = filters.specialty?.trim();
	const conditions: Prisma.userWhereInput[] = [];

	if (search) {
		conditions.push({
			OR: [
				{ displayName: { contains: search, mode: "insensitive" } },
				{ specialty: { contains: search, mode: "insensitive" } },
				{
					professionalCategory: {
						contains: search,
						mode: "insensitive",
					},
				},
				{ bio: { contains: search, mode: "insensitive" } },
				{ approach: { contains: search, mode: "insensitive" } },
				{ clinicAddress: { contains: search, mode: "insensitive" } },
				{
					clinicEmployees: {
						some: {
							active: true,
							clinic: {
								address: { contains: search, mode: "insensitive" },
							},
						},
					},
				},
				{ name: { contains: search, mode: "insensitive" } },
			],
		});
	}

	if (specialty) {
		conditions.push({
			OR: [
				{ specialty: { contains: specialty, mode: "insensitive" } },
				{
					professionalCategory: {
						contains: specialty,
						mode: "insensitive",
					},
				},
			],
		});
	}

	if (filters.serviceModality) {
		conditions.push({ serviceModalities: { has: filters.serviceModality } });
	}

	if (filters.language) {
		conditions.push({ languages: { has: filters.language } });
	}

	if (filters.insurance) {
		conditions.push({ acceptedInsurance: { has: filters.insurance } });
	}

	if (filters.city) {
		conditions.push({
			clinicCity: { contains: filters.city, mode: "insensitive" },
		});
	}

	if (filters.neighborhood) {
		conditions.push({
			clinicNeighborhood: {
				contains: filters.neighborhood,
				mode: "insensitive",
			},
		});
	}

	if (
		typeof filters.latitude === "number" &&
		typeof filters.longitude === "number"
	) {
		const bounds = calculateCoordinateBounds({
			latitude: filters.latitude,
			longitude: filters.longitude,
			radiusInKm: filters.radiusInKm ?? 25,
		});

		conditions.push({
			OR: [
				{
					clinicLatitude: {
						gte: bounds.minLatitude,
						lte: bounds.maxLatitude,
					},
					clinicLongitude: {
						gte: bounds.minLongitude,
						lte: bounds.maxLongitude,
					},
				},
				{
					clinicEmployees: {
						some: {
							active: true,
							clinic: {
								latitude: {
									gte: bounds.minLatitude,
									lte: bounds.maxLatitude,
								},
								longitude: {
									gte: bounds.minLongitude,
									lte: bounds.maxLongitude,
								},
							},
						},
					},
				},
			],
		});
	}

	if (filters.verified) {
		conditions.push({ verificationStatus: "VERIFIED" });
	}

	if (typeof filters.maxPriceCents === "number") {
		conditions.push({
			procedures: {
				some: {
					priceInCents: {
						lte: filters.maxPriceCents,
					},
				},
			},
		});
	}

	return conditions.length > 0 ? { AND: conditions } : undefined;
}

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
				data: {
					role: "HEALTHCARE_PROVIDER",
					displayName: data.displayName,
					document: data.document,
					birthDate: data.birthDate,
					gender: data.gender,
					languages: data.languages,
					specialty: data.specialty,
					professionalCategory: data.professionalCategory,
					professionalId: data.professionalId,
					licenseCouncil: data.licenseCouncil,
					licenseState: data.licenseState,
					licenseDocumentKey: data.licenseDocumentKey,
					licenseDocumentFileName: data.licenseDocumentFileName,
					licenseDocumentMimeType: data.licenseDocumentMimeType,
					licenseDocumentSize: data.licenseDocumentSize,
					licenseDocumentSha256: data.licenseDocumentSha256,
					licenseDocumentUploadedAt: data.licenseDocumentUploadedAt,
					verificationStatus: data.verificationStatus,
					verificationRejectionReason: data.verificationRejectionReason,
					verifiedAt: data.verifiedAt,
					verifiedByUserId: data.verifiedByUserId,
					bio: data.bio,
					approach: data.approach,
					education: data.education,
					certifications: data.certifications,
					yearsOfExperience: data.yearsOfExperience,
					targetAudiences: data.targetAudiences,
					serviceModalities: data.serviceModalities,
					clinicAddress: data.clinicAddress,
					clinicLatitude: data.clinicLatitude,
					clinicLongitude: data.clinicLongitude,
					clinicNeighborhood: data.clinicNeighborhood,
					clinicCity: data.clinicCity,
					clinicState: data.clinicState,
					homeCareRadiusKm: data.homeCareRadiusKm,
					acceptedInsurance: data.acceptedInsurance,
					paymentMethods: data.paymentMethods,
					cancellationPolicy: data.cancellationPolicy,
					cancellationPolicyEnabled: data.cancellationPolicyEnabled,
					cancellationPolicyHoursBefore: data.cancellationPolicyHoursBefore,
					cancellationPolicyPenaltyType: data.cancellationPolicyPenaltyType,
					cancellationPolicyFixedFeeCents: data.cancellationPolicyFixedFeeCents,
					cancellationPolicyPercentage: data.cancellationPolicyPercentage,
					cancellationPolicyRequiresJustification:
						data.cancellationPolicyRequiresJustification,
					clinicPhotos: data.clinicPhotos,
					termsAcceptedAt: data.termsAcceptedAt,
					lgpdConsentAt: data.lgpdConsentAt,
					professionalResponsibilityAcceptedAt:
						data.professionalResponsibilityAcceptedAt,
					faqs: data.faqs
						? {
								create: data.faqs.map((faq, index) => ({
									question: faq.question,
									answer: faq.answer,
									position: index,
								})),
							}
						: undefined,
				},
				include: healthcareProviderInclude,
			});

			return toHealthcareProvider(healthcareProvider);
		},

		async update(id: string, data: UpdateHealthcareProviderData) {
			const healthcareProvider = await prisma.$transaction(async (tx) => {
				const updatedProfessional = await tx.user.update({
					where: { id },
					data: {
						...(data.displayName !== undefined && {
							displayName: data.displayName,
						}),
						...(data.document !== undefined && { document: data.document }),
						...(data.birthDate !== undefined && { birthDate: data.birthDate }),
						...(data.gender !== undefined && { gender: data.gender }),
						...(data.languages !== undefined && { languages: data.languages }),
						...(data.specialty !== undefined && { specialty: data.specialty }),
						...(data.professionalCategory !== undefined && {
							professionalCategory: data.professionalCategory,
						}),
						...(data.professionalId !== undefined && {
							professionalId: data.professionalId,
						}),
						...(data.licenseCouncil !== undefined && {
							licenseCouncil: data.licenseCouncil,
						}),
						...(data.licenseState !== undefined && {
							licenseState: data.licenseState,
						}),
						...(data.licenseDocumentKey !== undefined && {
							licenseDocumentKey: data.licenseDocumentKey,
						}),
						...(data.licenseDocumentFileName !== undefined && {
							licenseDocumentFileName: data.licenseDocumentFileName,
						}),
						...(data.licenseDocumentMimeType !== undefined && {
							licenseDocumentMimeType: data.licenseDocumentMimeType,
						}),
						...(data.licenseDocumentSize !== undefined && {
							licenseDocumentSize: data.licenseDocumentSize,
						}),
						...(data.licenseDocumentSha256 !== undefined && {
							licenseDocumentSha256: data.licenseDocumentSha256,
						}),
						...(data.licenseDocumentUploadedAt !== undefined && {
							licenseDocumentUploadedAt: data.licenseDocumentUploadedAt,
						}),
						...(data.verificationStatus !== undefined && {
							verificationStatus: data.verificationStatus,
						}),
						...(data.verificationRejectionReason !== undefined && {
							verificationRejectionReason: data.verificationRejectionReason,
						}),
						...(data.verifiedAt !== undefined && {
							verifiedAt: data.verifiedAt,
						}),
						...(data.verifiedByUserId !== undefined && {
							verifiedByUserId: data.verifiedByUserId,
						}),
						...(data.bio !== undefined && { bio: data.bio }),
						...(data.approach !== undefined && { approach: data.approach }),
						...(data.education !== undefined && { education: data.education }),
						...(data.certifications !== undefined && {
							certifications: data.certifications,
						}),
						...(data.yearsOfExperience !== undefined && {
							yearsOfExperience: data.yearsOfExperience,
						}),
						...(data.targetAudiences !== undefined && {
							targetAudiences: data.targetAudiences,
						}),
						...(data.serviceModalities !== undefined && {
							serviceModalities: data.serviceModalities,
						}),
						...(data.clinicAddress !== undefined && {
							clinicAddress: data.clinicAddress,
						}),
						...(data.clinicLatitude !== undefined && {
							clinicLatitude: data.clinicLatitude,
						}),
						...(data.clinicLongitude !== undefined && {
							clinicLongitude: data.clinicLongitude,
						}),
						...(data.clinicNeighborhood !== undefined && {
							clinicNeighborhood: data.clinicNeighborhood,
						}),
						...(data.clinicCity !== undefined && {
							clinicCity: data.clinicCity,
						}),
						...(data.clinicState !== undefined && {
							clinicState: data.clinicState,
						}),
						...(data.homeCareRadiusKm !== undefined && {
							homeCareRadiusKm: data.homeCareRadiusKm,
						}),
						...(data.acceptedInsurance !== undefined && {
							acceptedInsurance: data.acceptedInsurance,
						}),
						...(data.paymentMethods !== undefined && {
							paymentMethods: data.paymentMethods,
						}),
						...(data.cancellationPolicy !== undefined && {
							cancellationPolicy: data.cancellationPolicy,
						}),
						...(data.cancellationPolicyEnabled !== undefined && {
							cancellationPolicyEnabled: data.cancellationPolicyEnabled,
						}),
						...(data.cancellationPolicyHoursBefore !== undefined && {
							cancellationPolicyHoursBefore:
								data.cancellationPolicyHoursBefore,
						}),
						...(data.cancellationPolicyPenaltyType !== undefined && {
							cancellationPolicyPenaltyType:
								data.cancellationPolicyPenaltyType,
						}),
						...(data.cancellationPolicyFixedFeeCents !== undefined && {
							cancellationPolicyFixedFeeCents:
								data.cancellationPolicyFixedFeeCents,
						}),
						...(data.cancellationPolicyPercentage !== undefined && {
							cancellationPolicyPercentage:
								data.cancellationPolicyPercentage,
						}),
						...(data.cancellationPolicyRequiresJustification !==
							undefined && {
							cancellationPolicyRequiresJustification:
								data.cancellationPolicyRequiresJustification,
						}),
						...(data.clinicPhotos !== undefined && {
							clinicPhotos: data.clinicPhotos,
						}),
						...(data.termsAcceptedAt !== undefined && {
							termsAcceptedAt: data.termsAcceptedAt,
						}),
						...(data.lgpdConsentAt !== undefined && {
							lgpdConsentAt: data.lgpdConsentAt,
						}),
						...(data.professionalResponsibilityAcceptedAt !== undefined && {
							professionalResponsibilityAcceptedAt:
								data.professionalResponsibilityAcceptedAt,
						}),
					},
				});

				if (data.faqs !== undefined) {
					await tx.healthcare_provider_faq.deleteMany({
						where: { healthcareProviderId: id },
					});

					if (data.faqs.length > 0) {
						await tx.healthcare_provider_faq.createMany({
							data: data.faqs.map((faq, index) => ({
								healthcareProviderId: id,
								question: faq.question,
								answer: faq.answer,
								position: index,
							})),
						});
					}
				}

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
