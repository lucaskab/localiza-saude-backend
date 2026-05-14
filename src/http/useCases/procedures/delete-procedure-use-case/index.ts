import { prismaProcedureRepository } from "@/http/repositories/procedures/procedures-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import type { user } from "../../../../../prisma/generated/prisma/client";

export const deleteProcedureUseCase = {
	async execute(currentUser: user, id: string): Promise<{ message: string }> {
		const existingProcedure = await prismaProcedureRepository.findById(id);

		if (!existingProcedure) {
			throw new BadRequestError("Procedure not found");
		}

		await clinicRbac.assertCanManageProvider(
			currentUser,
			existingProcedure.healthcareProviderId,
			"MANAGE_PROCEDURES",
		);

		await prismaProcedureRepository.delete(id);

		return { message: "Procedure deleted successfully" };
	},
};
