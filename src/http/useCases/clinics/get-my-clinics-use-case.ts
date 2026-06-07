import { prisma } from "@/database/prisma";
import { attachPrimaryAddressesToOwners } from "@/http/useCases/addresses/attach-primary-addresses";
import type { user } from "../../../../prisma/generated/prisma/client";

export const getMyClinicsUseCase = {
	async execute(currentUser: user) {
		const clinics = await prisma.clinic.findMany({
			where: {
				employees: {
					some: {
						userId: currentUser.id,
						active: true,
					},
				},
			},
			include: {
				employees: {
					where: { active: true },
					include: { user: true },
					orderBy: [{ role: "asc" }, { createdAt: "asc" }],
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return {
			clinics: await attachPrimaryAddressesToOwners("CLINIC", clinics, "CLINIC"),
		};
	},
};
