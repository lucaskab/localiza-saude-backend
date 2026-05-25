import type { CreateClinicBodySchema } from "@/schemas/routes/clinics/create-clinic";
import { prisma } from "@/database/prisma";
import { CLINIC_OWNER_PERMISSIONS } from "@/http/services/clinic-rbac";
import {
	attachPrimaryAddressToOwner,
	type WithPrimaryAddress,
} from "@/http/useCases/addresses/attach-primary-addresses";
import { upsertPrimaryAddressUseCase } from "@/http/useCases/addresses/upsert-primary-address-use-case";
import type { clinic, user } from "../../../../../prisma/generated/prisma/client";

export const createClinicUseCase = {
	async execute(
		currentUser: user,
		body: CreateClinicBodySchema,
	): Promise<{ clinic: WithPrimaryAddress<clinic> }> {
		const { address, ownerId, ...data } = body;

		const clinic = await prisma.$transaction(async (tx) => {
			return tx.clinic.create({
				data: {
					name: data.name,
					phone: data.phone,
					description: data.description,
					email: data.email,
					type: data.type,
					ownerId: ownerId ?? currentUser.id,
					employees: {
						create: {
							userId: currentUser.id,
							role: "OWNER",
							permissions: CLINIC_OWNER_PERMISSIONS,
							active: true,
						},
					},
				},
			});
		});

		if (address) {
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
