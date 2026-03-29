import { prismaClinicRepository } from "@/http/repositories/clinics/clinics-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const deleteClinicUseCase = {
	async execute(id: string): Promise<{ message: string }> {
		const existingClinic = await prismaClinicRepository.findById(id);

		if (!existingClinic) {
			throw new BadRequestError("Clinic not found");
		}

		await prismaClinicRepository.delete(id);

		return { message: "Clinic deleted successfully" };
	},
};
