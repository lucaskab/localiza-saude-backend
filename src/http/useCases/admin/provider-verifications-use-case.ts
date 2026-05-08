import { prisma } from "@/database/prisma";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { storageService } from "@/http/services/storage.service";
import type {
	Prisma,
	user,
} from "../../../../prisma/generated/prisma/client";
import type {
	ApproveProviderVerificationBodySchema,
	GetAdminProviderVerificationsQuerySchema,
	RejectProviderVerificationBodySchema,
} from "@/schemas/routes/admin/provider-verifications";

const providerVerificationInclude = {
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
	verifiedByUser: true,
	providerVerificationReviews: {
		include: {
			reviewerUser: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	},
} satisfies Prisma.userInclude;

function assertAdmin(currentUser: user) {
	if (currentUser.role !== "ADMIN") {
		throw new UnauthorizedError("Admin access required");
	}
}

function buildWhere(
	filters: GetAdminProviderVerificationsQuerySchema,
): Prisma.userWhereInput {
	const conditions: Prisma.userWhereInput[] = [];

	if (filters.status) {
		conditions.push({
			verificationStatus: filters.status,
		});
	}

	if (filters.search) {
		conditions.push({
			OR: [
				{ name: { contains: filters.search, mode: "insensitive" } },
				{ displayName: { contains: filters.search, mode: "insensitive" } },
				{ email: { contains: filters.search, mode: "insensitive" } },
				{ specialty: { contains: filters.search, mode: "insensitive" } },
				{
					professionalCategory: {
						contains: filters.search,
						mode: "insensitive",
					},
				},
				{ professionalId: { contains: filters.search, mode: "insensitive" } },
				{ licenseCouncil: { contains: filters.search, mode: "insensitive" } },
				{ licenseState: { contains: filters.search, mode: "insensitive" } },
			],
		});
	}

	return {
		role: "HEALTHCARE_PROVIDER",
		...(conditions.length > 0 && {
			AND: conditions,
		}),
	};
}

async function getProviderOrThrow(healthcareProviderId: string) {
	const healthcareProvider = await prisma.user.findFirst({
		where: {
			id: healthcareProviderId,
			role: "HEALTHCARE_PROVIDER",
		},
		include: providerVerificationInclude,
	});

	if (!healthcareProvider) {
		throw new BadRequestError("Healthcare provider not found");
	}

	return healthcareProvider;
}

function assertReadyForApproval(
	healthcareProvider: Awaited<ReturnType<typeof getProviderOrThrow>>,
) {
	const missingFields = [
		["professionalCategory", healthcareProvider.professionalCategory],
		["specialty", healthcareProvider.specialty],
		["licenseCouncil", healthcareProvider.licenseCouncil],
		["licenseState", healthcareProvider.licenseState],
		["professionalId", healthcareProvider.professionalId],
		["licenseDocumentKey", healthcareProvider.licenseDocumentKey],
	].filter(([, value]) => !value);

	if (missingFields.length > 0) {
		throw new BadRequestError(
			`Provider verification is missing required fields: ${missingFields
				.map(([field]) => field)
				.join(", ")}`,
		);
	}
}

export const providerVerificationsUseCase = {
	async list(currentUser: user, filters: GetAdminProviderVerificationsQuerySchema) {
		assertAdmin(currentUser);

		const where = buildWhere(filters);

		const [healthcareProviders, total] = await prisma.$transaction([
			prisma.user.findMany({
				where,
				include: providerVerificationInclude,
				orderBy: [
					{
						licenseDocumentUploadedAt: "desc",
					},
					{
						updatedAt: "desc",
					},
				],
				take: filters.limit,
				skip: filters.offset,
			}),
			prisma.user.count({
				where,
			}),
		]);

		return {
			healthcareProviders,
			total,
			limit: filters.limit,
			offset: filters.offset,
			hasMore: filters.offset + healthcareProviders.length < total,
		};
	},

	async get(currentUser: user, healthcareProviderId: string) {
		assertAdmin(currentUser);

		const healthcareProvider = await getProviderOrThrow(healthcareProviderId);

		return {
			healthcareProvider,
		};
	},

	async approve(
		currentUser: user,
		healthcareProviderId: string,
		body: ApproveProviderVerificationBodySchema,
	) {
		assertAdmin(currentUser);

		const healthcareProvider = await getProviderOrThrow(healthcareProviderId);
		assertReadyForApproval(healthcareProvider);

		await prisma.$transaction([
			prisma.user.update({
				where: {
					id: healthcareProvider.id,
				},
				data: {
					verificationStatus: "VERIFIED",
					verifiedAt: new Date(),
					verifiedByUserId: currentUser.id,
					verificationRejectionReason: null,
				},
			}),
			prisma.provider_verification_review.create({
				data: {
					healthcareProviderId: healthcareProvider.id,
					reviewerUserId: currentUser.id,
					status: "APPROVED",
					internalNotes: body.internalNotes ?? null,
					documentKey: healthcareProvider.licenseDocumentKey,
					documentSha256: healthcareProvider.licenseDocumentSha256,
				},
			}),
		]);

		return providerVerificationsUseCase.get(currentUser, healthcareProvider.id);
	},

	async reject(
		currentUser: user,
		healthcareProviderId: string,
		body: RejectProviderVerificationBodySchema,
	) {
		assertAdmin(currentUser);

		const healthcareProvider = await getProviderOrThrow(healthcareProviderId);

		await prisma.$transaction([
			prisma.user.update({
				where: {
					id: healthcareProvider.id,
				},
				data: {
					verificationStatus: "REJECTED",
					verifiedAt: null,
					verifiedByUserId: currentUser.id,
					verificationRejectionReason: body.reason,
				},
			}),
			prisma.provider_verification_review.create({
				data: {
					healthcareProviderId: healthcareProvider.id,
					reviewerUserId: currentUser.id,
					status: "REJECTED",
					reason: body.reason,
					internalNotes: body.internalNotes ?? null,
					documentKey: healthcareProvider.licenseDocumentKey,
					documentSha256: healthcareProvider.licenseDocumentSha256,
				},
			}),
		]);

		return providerVerificationsUseCase.get(currentUser, healthcareProvider.id);
	},

	async getDocument(params: {
		currentUser: user;
		healthcareProviderId: string;
		ipAddress?: string | null;
		userAgent?: string | null;
	}) {
		assertAdmin(params.currentUser);

		const healthcareProvider = await getProviderOrThrow(params.healthcareProviderId);

		if (!healthcareProvider.licenseDocumentKey) {
			throw new BadRequestError("License document not found");
		}

		await prisma.provider_verification_document_access_log.create({
			data: {
				healthcareProviderId: healthcareProvider.id,
				adminUserId: params.currentUser.id,
				documentKey: healthcareProvider.licenseDocumentKey,
				ipAddress: params.ipAddress ?? null,
				userAgent: params.userAgent ?? null,
			},
		});

		return {
			document: {
				url: storageService.presignUrl(healthcareProvider.licenseDocumentKey, 60),
				expiresInSeconds: 60,
				fileName: healthcareProvider.licenseDocumentFileName,
				fileSize: healthcareProvider.licenseDocumentSize,
				mimeType: healthcareProvider.licenseDocumentMimeType,
				sha256: healthcareProvider.licenseDocumentSha256,
				uploadedAt: healthcareProvider.licenseDocumentUploadedAt,
			},
		};
	},
};
