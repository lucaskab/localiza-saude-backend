import type {
	CreateHealthcareProviderData,
	HealthcareProviderWithRelations,
} from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { geocodingService } from "@/http/services/geocoding-service";
import { signClinicPhotoUrls } from "@/http/useCases/healthcare-providers/sign-clinic-photo-urls";

export const createHealthcareProviderUseCase = {
	async execute(
		data: CreateHealthcareProviderData,
	): Promise<{ healthcareProvider: HealthcareProviderWithRelations }> {
		const dataWithLocation = { ...data };

		if (
			data.clinicAddress?.trim() &&
			(data.clinicLatitude === undefined || data.clinicLongitude === undefined)
		) {
			const location = await geocodingService.geocode(data.clinicAddress);

			dataWithLocation.clinicLatitude = location?.latitude ?? null;
			dataWithLocation.clinicLongitude = location?.longitude ?? null;
			dataWithLocation.clinicNeighborhood = location?.neighborhood ?? null;
			dataWithLocation.clinicCity = location?.city ?? null;
			dataWithLocation.clinicState = location?.state ?? null;
		}

		const healthcareProvider =
			await prismaHealthcareProviderRepository.create(dataWithLocation);

		return { healthcareProvider: signClinicPhotoUrls(healthcareProvider) };
	},
};
