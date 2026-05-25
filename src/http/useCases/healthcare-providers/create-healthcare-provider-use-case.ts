import type { CreateHealthcareProviderBodySchema } from "@/schemas/routes/healthcare-providers/create-healthcare-provider";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { attachPrimaryAddressToOwner } from "@/http/useCases/addresses/attach-primary-addresses";
import { signClinicPhotoUrls } from "@/http/useCases/healthcare-providers/sign-clinic-photo-urls";
import { syncProviderClinicAddress } from "./sync-provider-address";

export const createHealthcareProviderUseCase = {
	async execute(body: CreateHealthcareProviderBodySchema) {
		const { address, ...data } = body;

		const healthcareProvider =
			await prismaHealthcareProviderRepository.create(data);

		await syncProviderClinicAddress(healthcareProvider.id, address);

		const withAddress = await attachPrimaryAddressToOwner(
			"USER",
			signClinicPhotoUrls(healthcareProvider),
			"CLINIC",
		);

		return { healthcareProvider: withAddress };
	},
};
