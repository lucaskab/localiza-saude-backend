import type {
	ProcedureWithChecklist,
	UpdateProcedureData,
} from "@/http/repositories/procedures/procedures-repository-contract";
import { prismaProcedureRepository } from "@/http/repositories/procedures/procedures-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import type { user } from "../../../../prisma/generated/prisma/client";

export const updateProcedureUseCase = {
	async execute(
		currentUser: user,
		id: string,
		data: UpdateProcedureData,
	): Promise<{ procedure: ProcedureWithChecklist }> {
		const existingProcedure = await prismaProcedureRepository.findById(id);

		if (!existingProcedure) {
			throw new BadRequestError("Procedure not found");
		}

		await clinicRbac.assertCanManageProvider(
			currentUser,
			existingProcedure.healthcareProviderId,
			"MANAGE_PROCEDURES",
		);

		const procedure = await prismaProcedureRepository.update(id, data);

		return { procedure };
	},
};
