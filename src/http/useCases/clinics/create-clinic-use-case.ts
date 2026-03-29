import type { CreateClinicData } from "@/http/repositories/clinics/clinics-repository-contract";
import { prismaClinicRepository } from "@/http/repositories/clinics/clinics-repository-implementation";
import type { clinic } from "../../../../prisma/generated/prisma/client";

export const createClinicUseCase = {
	async execute(data: CreateClinicData): Promise<{ clinic: clinic }> {
		const clinic = await prismaClinicRepository.create(data);

		return { clinic };
	},
};
