import { prismaProcedureRepository } from "@/http/repositories/procedures/procedures-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { ProcedureWithChecklist } from "@/http/repositories/procedures/procedures-repository-contract";

export const getProcedureByIdUseCase = {
	async execute(id: string): Promise<{ procedure: ProcedureWithChecklist }> {
		const procedure = await prismaProcedureRepository.findById(id);

		if (!procedure) {
			throw new BadRequestError("Procedure not found");
		}

		return { procedure };
	},
};
