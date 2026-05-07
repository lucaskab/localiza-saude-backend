import type {
	HealthcareProviderWithRelations,
	UpdateHealthcareProviderData,
} from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
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

		const healthcareProvider = await prismaHealthcareProviderRepository.update(
			id,
			data,
		);

		return { healthcareProvider: signClinicPhotoUrls(healthcareProvider) };
	},
};
