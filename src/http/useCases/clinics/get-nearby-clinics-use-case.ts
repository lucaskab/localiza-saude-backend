import type { FindNearbyParams } from "@/http/repositories/clinics/clinics-repository-contract";
import { prismaClinicRepository } from "@/http/repositories/clinics/clinics-repository-implementation";
import type { clinic } from "../../../../prisma/generated/prisma/client";

export const getNearbyClinicsUseCase = {
	async execute(params: FindNearbyParams): Promise<{ clinics: clinic[] }> {
		const clinics = await prismaClinicRepository.findNearby(params);

		return { clinics };
	},
};
