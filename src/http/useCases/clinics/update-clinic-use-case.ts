import type { UpdateClinicData } from "@/http/repositories/clinics/clinics-repository-contract";
import { prismaClinicRepository } from "@/http/repositories/clinics/clinics-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import { geocodingService } from "@/http/services/geocoding-service";
import type { clinic, user } from "../../../../prisma/generated/prisma/client";

export const updateClinicUseCase = {
	async execute(
		currentUser: user,
		id: string,
		data: UpdateClinicData,
	): Promise<{ clinic: clinic }> {
		const existingClinic = await prismaClinicRepository.findById(id);

		if (!existingClinic) {
			throw new BadRequestError("Clinic not found");
		}

		await clinicRbac.assertCanManageClinic(
			currentUser,
			id,
			"MANAGE_CLINIC_INFO",
		);

		const nextData = { ...data };

		if (data.address !== undefined) {
			const location = await geocodingService.geocode(data.address);
			nextData.latitude = location?.latitude ?? data.latitude ?? null;
			nextData.longitude = location?.longitude ?? data.longitude ?? null;
		}

		const clinic = await prismaClinicRepository.update(id, nextData);

		return { clinic };
	},
};
