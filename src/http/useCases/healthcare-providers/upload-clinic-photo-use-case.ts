import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { validateProviderClinicPhotoFile } from "@/http/services/provider-clinic-photo-security";
import { storageService } from "@/http/services/storage.service";
import { signClinicPhotoUrls } from "@/http/useCases/healthcare-providers/sign-clinic-photo-urls";
import type { user } from "../../../../prisma/generated/prisma/client";

const MAX_CLINIC_PHOTOS = 8;

export const uploadClinicPhotoUseCase = {
	async execute(params: {
		healthcareProviderId: string;
		currentUser: user;
		buffer: Buffer;
		mimeType: string;
	}) {
		const provider = await prismaHealthcareProviderRepository.findById(
			params.healthcareProviderId,
		);

		if (!provider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		if (provider.userId !== params.currentUser.id) {
			throw new UnauthorizedError(
				"You can only upload clinic photos for your own healthcare provider profile",
			);
		}

		if (provider.clinicPhotos.length >= MAX_CLINIC_PHOTOS) {
			throw new BadRequestError("Clinic photo limit reached");
		}

		const photo = validateProviderClinicPhotoFile({
			buffer: params.buffer,
			mimeType: params.mimeType,
		});
		const file = new File([params.buffer], photo.storageFileName, {
			type: photo.mimeType,
		});
		const uploadResult = await storageService.uploadFile({
			file,
			folder: `provider-clinic-photos/${provider.id}`,
			fileName: photo.storageFileName,
		});

		try {
			const healthcareProvider =
				await prismaHealthcareProviderRepository.update(provider.id, {
					clinicPhotos: [...provider.clinicPhotos, uploadResult.key],
				});

			return {
				healthcareProvider: signClinicPhotoUrls(healthcareProvider),
				photo: {
					url: storageService.presignUrl(uploadResult.key, 3600),
					expiresInSeconds: 3600,
				},
			};
		} catch (error) {
			await storageService.deleteFile(uploadResult.key).catch(() => undefined);
			throw error;
		}
	},
};
