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
		orderBy: {
			createdAt: "desc",
		},
	},
	faqs: {
		orderBy: {
			position: "asc",
		},
	},
} satisfies Prisma.userInclude;

type HealthcareProviderQueryResult = Prisma.userGetPayload<{
	include: typeof healthcareProviderInclude;
}>;

function toHealthcareProvider(
	user: HealthcareProviderQueryResult,
): HealthcareProviderWithRelations {
	const { procedures, faqs, ...profile } = user;

	return {
		...profile,
		procedures: procedures,
		faqs: faqs,
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
			const healthcareProviders = await prisma.user.findMany({
				where: {
					role: "HEALTHCARE_PROVIDER",
					...(where ? { AND: [where] } : {}),
				},
				include: healthcareProviderInclude,
				orderBy: {
					createdAt: "desc",
				},
			});

			return healthcareProviders.map(toHealthcareProvider);
		},

		async findById(id: string) {
			const healthcareProvider = await prisma.user.findUnique({
				where: { id, role: "HEALTHCARE_PROVIDER" },
				include: healthcareProviderInclude,
			});

			return healthcareProvider ? toHealthcareProvider(healthcareProvider) : null;
		},

		async findByUserId(userId: string) {
			const healthcareProvider = await prisma.user.findUnique({
				where: { id: userId, role: "HEALTHCARE_PROVIDER" },
				include: healthcareProviderInclude,
			});

			return healthcareProvider ? toHealthcareProvider(healthcareProvider) : null;
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
					homeCareRadiusKm: data.homeCareRadiusKm,
					acceptedInsurance: data.acceptedInsurance,
					paymentMethods: data.paymentMethods,
					cancellationPolicy: data.cancellationPolicy,
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
							verificationRejectionReason:
								data.verificationRejectionReason,
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
