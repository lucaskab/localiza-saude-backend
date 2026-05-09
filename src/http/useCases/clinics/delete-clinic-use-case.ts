import { prismaClinicRepository } from "@/http/repositories/clinics/clinics-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import type { user } from "../../../../prisma/generated/prisma/client";

export const deleteClinicUseCase = {
	async execute(currentUser: user, id: string): Promise<{ message: string }> {
		const existingClinic = await prismaClinicRepository.findById(id);

		if (!existingClinic) {
			throw new BadRequestError("Clinic not found");
		}

		await clinicRbac.assertCanManageClinic(
			currentUser,
			id,
			"MANAGE_CLINIC_INFO",
		);

		await prismaClinicRepository.delete(id);

		return { message: "Clinic deleted successfully" };
	},
};
