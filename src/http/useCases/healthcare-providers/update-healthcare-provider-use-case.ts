import type {
	HealthcareProviderWithRelations,
	UpdateHealthcareProviderData,
} from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { geocodingService } from "@/http/services/geocoding-service";
import { signClinicPhotoUrls } from "@/http/useCases/healthcare-providers/sign-clinic-photo-urls";
import type { user } from "../../../../prisma/generated/prisma/client";

export const updateHealthcareProviderUseCase = {
	async execute(
		id: string,
		data: UpdateHealthcareProviderData,
		currentUser: user,
	): Promise<{ healthcareProvider: HealthcareProviderWithRelations }> {
		const existingProvider =
			await prismaHealthcareProviderRepository.findById(id);

		if (!existingProvider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		if (existingProvider.id !== currentUser.id) {
			throw new UnauthorizedError(
				"You can only update your own healthcare provider profile",
			);
		}

		const dataWithLocation = { ...data };

		if (data.clinicAddress !== undefined) {
			if (!data.clinicAddress?.trim()) {
				dataWithLocation.clinicLatitude = null;
				dataWithLocation.clinicLongitude = null;
				dataWithLocation.clinicNeighborhood = null;
				dataWithLocation.clinicCity = null;
				dataWithLocation.clinicState = null;
			} else if (
				data.clinicLatitude === undefined ||
				data.clinicLongitude === undefined
			) {
				const location = await geocodingService.geocode(data.clinicAddress);

				dataWithLocation.clinicLatitude = location?.latitude ?? null;
				dataWithLocation.clinicLongitude = location?.longitude ?? null;
				dataWithLocation.clinicNeighborhood = location?.neighborhood ?? null;
				dataWithLocation.clinicCity = location?.city ?? null;
				dataWithLocation.clinicState = location?.state ?? null;
			}
		}

		const healthcareProvider = await prismaHealthcareProviderRepository.update(
			id,
			dataWithLocation,
		);

		return { healthcareProvider: signClinicPhotoUrls(healthcareProvider) };
	},
};
