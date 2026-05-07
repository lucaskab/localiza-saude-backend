import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { storageService } from "@/http/services/storage.service";
import type { user } from "../../../../prisma/generated/prisma/client";

export const deleteLicenseDocumentUseCase = {
	async execute(params: { healthcareProviderId: string; currentUser: user }) {
		const provider = await prismaHealthcareProviderRepository.findById(
			params.healthcareProviderId,
		);

		if (!provider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		if (provider.id !== params.currentUser.id) {
			throw new UnauthorizedError(
				"You can only delete your own healthcare provider documents",
			);
		}

		const previousDocumentKey = provider.licenseDocumentKey;

		const healthcareProvider = await prismaHealthcareProviderRepository.update(
			provider.id,
			{
				licenseDocumentKey: null,
				licenseDocumentFileName: null,
				licenseDocumentMimeType: null,
				licenseDocumentSize: null,
				licenseDocumentSha256: null,
				licenseDocumentUploadedAt: null,
				verificationStatus: "PENDING",
				verifiedAt: null,
			},
		);

		if (previousDocumentKey) {
			await storageService.deleteFile(previousDocumentKey).catch(() => undefined);
		}

		return { healthcareProvider };
	},
};
