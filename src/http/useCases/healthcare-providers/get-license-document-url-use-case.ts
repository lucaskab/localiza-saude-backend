import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { storageService } from "@/http/services/storage.service";
import type { user } from "../../../../prisma/generated/prisma/client";

export const getLicenseDocumentUrlUseCase = {
	async execute(params: { healthcareProviderId: string; currentUser: user }) {
		const provider = await prismaHealthcareProviderRepository.findById(
			params.healthcareProviderId,
		);

		if (!provider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		if (provider.id !== params.currentUser.id) {
			throw new UnauthorizedError(
				"You can only access your own healthcare provider documents",
			);
		}

		if (!provider.licenseDocumentKey) {
			throw new BadRequestError("License document not found");
		}

		return {
			document: {
				url: storageService.presignUrl(provider.licenseDocumentKey, 60),
				expiresInSeconds: 60,
				fileName: provider.licenseDocumentFileName,
				fileSize: provider.licenseDocumentSize,
				mimeType: provider.licenseDocumentMimeType,
				sha256: provider.licenseDocumentSha256,
				uploadedAt: provider.licenseDocumentUploadedAt,
			},
		};
	},
};
