import type { CreateClinicData } from "@/http/repositories/clinics/clinics-repository-contract";
import { prisma } from "@/database/prisma";
import { CLINIC_OWNER_PERMISSIONS } from "@/http/services/clinic-rbac";
import { geocodingService } from "@/http/services/geocoding-service";
import type { clinic, user } from "../../../../prisma/generated/prisma/client";

export const createClinicUseCase = {
	async execute(
		currentUser: user,
		data: Omit<CreateClinicData, "ownerId"> & { ownerId?: string },
	): Promise<{ clinic: clinic }> {
		const location = await geocodingService.geocode(data.address);
		const clinic = await prisma.$transaction(async (tx) => {
			const clinic = await tx.clinic.create({
				data: {
					name: data.name,
					phone: data.phone,
					description: data.description,
					email: data.email,
					type: data.type,
					address: data.address,
					latitude: location?.latitude ?? data.latitude ?? null,
					longitude: location?.longitude ?? data.longitude ?? null,
					ownerId: currentUser.id,
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

			return clinic;
		});

		return { clinic };
	},
};
