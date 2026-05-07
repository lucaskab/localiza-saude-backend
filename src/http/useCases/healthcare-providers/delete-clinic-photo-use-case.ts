import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { storageService } from "@/http/services/storage.service";
import { signClinicPhotoUrls } from "@/http/useCases/healthcare-providers/sign-clinic-photo-urls";
import type { user } from "../../../../prisma/generated/prisma/client";

export const deleteClinicPhotoUseCase = {
	async execute(params: {
		healthcareProviderId: string;
		currentUser: user;
		index: number;
	}) {
		const provider = await prismaHealthcareProviderRepository.findById(
			params.healthcareProviderId,
		);

		if (!provider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		if (provider.id !== params.currentUser.id) {
			throw new UnauthorizedError(
				"You can only delete clinic photos from your own healthcare provider profile",
			);
		}

		const photoKey = provider.clinicPhotos[params.index];

		if (!photoKey) {
			throw new BadRequestError("Clinic photo not found");
		}

		const healthcareProvider = await prismaHealthcareProviderRepository.update(
			provider.id,
			{
				clinicPhotos: provider.clinicPhotos.filter(
					(_, index) => index !== params.index,
				),
			},
		);

		await storageService.deleteFile(photoKey).catch(() => undefined);

		return {
			healthcareProvider: signClinicPhotoUrls(healthcareProvider),
		};
	},
};
