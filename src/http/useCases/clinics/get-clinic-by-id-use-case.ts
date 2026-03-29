import { prismaClinicRepository } from "@/http/repositories/clinics/clinics-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { clinic } from "../../../../prisma/generated/prisma/client";

export const getClinicByIdUseCase = {
	async execute(id: string): Promise<{ clinic: clinic }> {
		const clinic = await prismaClinicRepository.findById(id);

		if (!clinic) {
			throw new BadRequestError("Clinic not found");
		}

		return { clinic };
	},
};
