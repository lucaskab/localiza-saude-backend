import { prismaClinicRepository } from "@/http/repositories/clinics/clinics-repository-implementation";
import type { clinic } from "../../../../prisma/generated/prisma/client";

export const getClinicsUseCase = {
	async execute(): Promise<{
		clinics: clinic[];
	}> {
		const clinics = await prismaClinicRepository.findAll();

		return { clinics };
	},
};
