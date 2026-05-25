import { prisma } from "@/database/prisma";
import type { ServiceModality } from "@/schemas/service-modalities";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import type {
	CreateHealthcareProviderData,
	FindAllHealthcareProviderFilters,
	HealthcareProviderWithRelations,
	UpdateHealthcareProviderData,
} from "./healthcare-providers-repository-contract";

export const healthcareProviderInclude = {
	professionalCouncil: true,
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

export function toHealthcareProvider(
	user: HealthcareProviderQueryResult,
): HealthcareProviderWithRelations {
	const { procedures, faqs, ...profile } = user;

	return {
		...profile,
		procedures,
		faqs,
	};
}

export function calculateDistanceInKm(params: {
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

export function createFindAllWhere(
	filters?: FindAllHealthcareProviderFilters,
) {
	if (!filters) {
		return undefined;
	}

	const search = filters.search?.trim();
	const specialty = filters.specialty?.trim();
	const conditions: Prisma.userWhereInput[] = [];

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
		conditions.push({
			serviceModalities: { has: filters.serviceModality as ServiceModality },
		});
	}

	if (filters.language) {
		conditions.push({ languages: { has: filters.language } });
	}

	if (filters.insurance) {
		conditions.push({ acceptedInsurance: { has: filters.insurance } });
	}

	conditions.push({ verificationStatus: "VERIFIED" });

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

export function buildHealthcareProviderCreateData(
	data: CreateHealthcareProviderData,
) {
	return {
		role: "HEALTHCARE_PROVIDER" as const,
		displayName: data.displayName,
		document: data.document,
		birthDate: data.birthDate,
		gender: data.gender,
		languages: data.languages,
		specialty: data.specialty,
		professionalCategory: data.professionalCategory,
		professionalId: data.professionalId,
		professionalCouncilId: data.professionalCouncilId,
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
		homeCareRadiusKm: data.homeCareRadiusKm,
		acceptedInsurance: data.acceptedInsurance,
		paymentMethods: data.paymentMethods,
		bookingAvailabilityDays: data.bookingAvailabilityDays ?? undefined,
		appointmentConfirmationReminderHoursBefore:
			data.appointmentConfirmationReminderHoursBefore ?? undefined,
		appointmentReminderHoursBefore:
			data.appointmentReminderHoursBefore ?? undefined,
		birthdayGreetingEmailEnabled: data.birthdayGreetingEmailEnabled ?? undefined,
		birthdayGreetingEmailSubjectTemplate:
			data.birthdayGreetingEmailSubjectTemplate,
		birthdayGreetingEmailHtmlTemplate: data.birthdayGreetingEmailHtmlTemplate,
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
	} satisfies Prisma.userUncheckedUpdateInput;
}

export function buildHealthcareProviderUpdateData(
	data: UpdateHealthcareProviderData,
) {
	return {
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
		...(data.professionalCouncilId !== undefined && {
			professionalCouncilId: data.professionalCouncilId,
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
		...(data.homeCareRadiusKm !== undefined && {
			homeCareRadiusKm: data.homeCareRadiusKm,
		}),
		...(data.acceptedInsurance !== undefined && {
			acceptedInsurance: data.acceptedInsurance,
		}),
		...(data.paymentMethods !== undefined && {
			paymentMethods: data.paymentMethods,
		}),
		...(data.bookingAvailabilityDays !== undefined && {
			bookingAvailabilityDays: data.bookingAvailabilityDays ?? undefined,
		}),
		...(data.appointmentConfirmationReminderHoursBefore !== undefined && {
			appointmentConfirmationReminderHoursBefore:
				data.appointmentConfirmationReminderHoursBefore ?? undefined,
		}),
		...(data.appointmentReminderHoursBefore !== undefined && {
			appointmentReminderHoursBefore:
				data.appointmentReminderHoursBefore ?? undefined,
		}),
		...(data.birthdayGreetingEmailEnabled !== undefined && {
			birthdayGreetingEmailEnabled: data.birthdayGreetingEmailEnabled,
		}),
		...(data.birthdayGreetingEmailSubjectTemplate !== undefined && {
			birthdayGreetingEmailSubjectTemplate:
				data.birthdayGreetingEmailSubjectTemplate,
		}),
		...(data.birthdayGreetingEmailHtmlTemplate !== undefined && {
			birthdayGreetingEmailHtmlTemplate: data.birthdayGreetingEmailHtmlTemplate,
		}),
		...(data.cancellationPolicy !== undefined && {
			cancellationPolicy: data.cancellationPolicy,
		}),
		...(data.cancellationPolicyEnabled !== undefined && {
			cancellationPolicyEnabled: data.cancellationPolicyEnabled,
		}),
		...(data.cancellationPolicyHoursBefore !== undefined && {
			cancellationPolicyHoursBefore: data.cancellationPolicyHoursBefore,
		}),
		...(data.cancellationPolicyPenaltyType !== undefined && {
			cancellationPolicyPenaltyType: data.cancellationPolicyPenaltyType,
		}),
		...(data.cancellationPolicyFixedFeeCents !== undefined && {
			cancellationPolicyFixedFeeCents: data.cancellationPolicyFixedFeeCents,
		}),
		...(data.cancellationPolicyPercentage !== undefined && {
			cancellationPolicyPercentage: data.cancellationPolicyPercentage,
		}),
		...(data.cancellationPolicyRequiresJustification !== undefined && {
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
	} satisfies Prisma.userUncheckedUpdateInput;
}

export async function replaceHealthcareProviderFaqs(
	tx: Prisma.TransactionClient,
	healthcareProviderId: string,
	faqs: UpdateHealthcareProviderData["faqs"],
) {
	if (faqs === undefined) {
		return;
	}

	await tx.healthcare_provider_faq.deleteMany({
		where: { healthcareProviderId },
	});

	if (faqs.length === 0) {
		return;
	}

	await tx.healthcare_provider_faq.createMany({
		data: faqs.map((faq, index) => ({
			healthcareProviderId,
			question: faq.question,
			answer: faq.answer,
			position: index,
		})),
	});
}
