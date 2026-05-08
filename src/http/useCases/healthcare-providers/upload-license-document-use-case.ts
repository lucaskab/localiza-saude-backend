import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { validateProviderDocumentFile } from "@/http/services/provider-document-security";
import { storageService } from "@/http/services/storage.service";
import type { user } from "../../../../prisma/generated/prisma/client";

export const uploadLicenseDocumentUseCase = {
	async execute(params: {
		healthcareProviderId: string;
		currentUser: user;
		buffer: Buffer;
		fileName: string;
		mimeType: string;
	}) {
		const provider = await prismaHealthcareProviderRepository.findById(
			params.healthcareProviderId,
		);

		if (!provider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		if (provider.id !== params.currentUser.id) {
			throw new UnauthorizedError(
				"You can only upload documents for your own healthcare provider profile",
			);
		}

		const document = validateProviderDocumentFile({
			buffer: params.buffer,
			fileName: params.fileName,
			mimeType: params.mimeType,
		});
		const file = new File([params.buffer], document.storageFileName, {
			type: document.mimeType,
		});
		const previousDocumentKey = provider.licenseDocumentKey;
		const uploadResult = await storageService.uploadFile({
			file,
			folder: `provider-documents/${provider.id}`,
			fileName: document.storageFileName,
		});

		const healthcareProvider = await prismaHealthcareProviderRepository.update(
			provider.id,
			{
				licenseDocumentKey: uploadResult.key,
				licenseDocumentFileName: document.safeOriginalFileName,
				licenseDocumentMimeType: document.mimeType,
				licenseDocumentSize: document.size,
				licenseDocumentSha256: document.sha256,
				licenseDocumentUploadedAt: new Date(),
				verificationStatus: "PENDING",
				verificationRejectionReason: null,
				verifiedAt: null,
				verifiedByUserId: null,
			},
		);

		if (previousDocumentKey && previousDocumentKey !== uploadResult.key) {
			await storageService.deleteFile(previousDocumentKey).catch(() => undefined);
		}

		return {
			healthcareProvider,
			document: {
				fileName: healthcareProvider.licenseDocumentFileName,
				fileSize: healthcareProvider.licenseDocumentSize,
				mimeType: healthcareProvider.licenseDocumentMimeType,
				sha256: healthcareProvider.licenseDocumentSha256,
				uploadedAt: healthcareProvider.licenseDocumentUploadedAt,
			},
		};
	},
};
