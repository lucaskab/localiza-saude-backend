import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const deleteHealthcareProviderUseCase = {
	async execute(id: string): Promise<{ message: string }> {
		const existingProvider =
			await prismaHealthcareProviderRepository.findById(id);

		if (!existingProvider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		await prismaHealthcareProviderRepository.delete(id);

		return { message: "Healthcare provider deleted successfully" };
	},
};
