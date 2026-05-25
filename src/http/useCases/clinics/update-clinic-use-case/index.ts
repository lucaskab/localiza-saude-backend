import type { UpdateClinicBodySchema } from "@/schemas/routes/clinics/update-clinic";
import { prismaClinicRepository } from "@/http/repositories/clinics/clinics-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import {
	attachPrimaryAddressToOwner,
	type WithPrimaryAddress,
} from "@/http/useCases/addresses/attach-primary-addresses";
import { upsertPrimaryAddressUseCase } from "@/http/useCases/addresses/upsert-primary-address-use-case";
import type { clinic, user } from "../../../../../prisma/generated/prisma/client";

export const updateClinicUseCase = {
	async execute(
		currentUser: user,
		id: string,
		body: UpdateClinicBodySchema,
	): Promise<{ clinic: WithPrimaryAddress<clinic> }> {
		const { address, ...data } = body;
		const existingClinic = await prismaClinicRepository.findById(id);

		if (!existingClinic) {
			throw new BadRequestError("Clinic not found");
		}

		await clinicRbac.assertCanManageClinic(
			currentUser,
			id,
			"MANAGE_CLINIC_INFO",
		);

		const clinic = await prismaClinicRepository.update(id, data);

		if (address !== undefined && address !== null) {
			await upsertPrimaryAddressUseCase.execute("CLINIC", clinic.id, {
				...address,
				type: address.type ?? "CLINIC",
			});
		}

		return {
			clinic: await attachPrimaryAddressToOwner("CLINIC", clinic, "CLINIC"),
		};
	},
};
