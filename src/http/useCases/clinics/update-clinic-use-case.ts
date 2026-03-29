import type { UpdateClinicData } from "@/http/repositories/clinics/clinics-repository-contract";
import { prismaClinicRepository } from "@/http/repositories/clinics/clinics-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { clinic } from "../../../../prisma/generated/prisma/client";

export const updateClinicUseCase = {
	async execute(
		id: string,
		data: UpdateClinicData,
	): Promise<{ clinic: clinic }> {
		const existingClinic = await prismaClinicRepository.findById(id);

		if (!existingClinic) {
			throw new BadRequestError("Clinic not found");
		}

		const clinic = await prismaClinicRepository.update(id, data);

		return { clinic };
	},
};
