import type { CreateProcedureData } from "@/http/repositories/procedures/procedures-repository-contract";
import { prismaProcedureRepository } from "@/http/repositories/procedures/procedures-repository-implementation";
import { clinicRbac } from "@/http/services/clinic-rbac";
import type { procedure, user } from "../../../../prisma/generated/prisma/client";

export const createProcedureUseCase = {
	async execute(
		currentUser: user,
		data: CreateProcedureData,
	): Promise<{ procedure: procedure }> {
		await clinicRbac.assertCanManageProvider(
			currentUser,
			data.healthcareProviderId,
			"MANAGE_PROCEDURES",
		);

		const procedure = await prismaProcedureRepository.create(data);

		return { procedure };
	},
};
