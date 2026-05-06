import type {
	CreateHealthcareProviderData,
	HealthcareProviderWithRelations,
} from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { signClinicPhotoUrls } from "@/http/useCases/healthcare-providers/sign-clinic-photo-urls";

export const createHealthcareProviderUseCase = {
	async execute(
		data: CreateHealthcareProviderData,
	): Promise<{ healthcareProvider: HealthcareProviderWithRelations }> {
		const healthcareProvider =
			await prismaHealthcareProviderRepository.create(data);

		return { healthcareProvider: signClinicPhotoUrls(healthcareProvider) };
	},
};
