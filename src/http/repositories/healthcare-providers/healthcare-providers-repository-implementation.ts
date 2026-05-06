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
					verifiedAt: data.verifiedAt,
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
					...(data.verifiedAt !== undefined && { verifiedAt: data.verifiedAt }),
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
