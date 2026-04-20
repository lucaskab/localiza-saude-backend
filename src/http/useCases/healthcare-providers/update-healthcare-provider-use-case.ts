import type {
	HealthcareProviderWithRelations,
	UpdateHealthcareProviderData,
} from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const updateHealthcareProviderUseCase = {
	async execute(
		id: string,
		data: UpdateHealthcareProviderData,
	): Promise<{ healthcareProvider: HealthcareProviderWithRelations }> {
		const existingProvider =
			await prismaHealthcareProviderRepository.findById(id);

		if (!existingProvider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		const healthcareProvider = await prismaHealthcareProviderRepository.update(
			id,
			data,
		);

		return { healthcareProvider };
	},
};
