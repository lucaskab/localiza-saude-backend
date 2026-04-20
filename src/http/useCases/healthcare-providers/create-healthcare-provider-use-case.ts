import type {
	CreateHealthcareProviderData,
	HealthcareProviderWithRelations,
} from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";

export const createHealthcareProviderUseCase = {
	async execute(
		data: CreateHealthcareProviderData,
	): Promise<{ healthcareProvider: HealthcareProviderWithRelations }> {
		const healthcareProvider =
			await prismaHealthcareProviderRepository.create(data);

		return { healthcareProvider };
	},
};
