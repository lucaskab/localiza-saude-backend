import { prismaProcedureRepository } from "@/http/repositories/procedures/procedures-repository-implementation";
import type { ProcedureWithChecklist } from "@/http/repositories/procedures/procedures-repository-contract";

export const getProceduresUseCase = {
	async execute(): Promise<{
		procedures: ProcedureWithChecklist[];
	}> {
		const procedures = await prismaProcedureRepository.findAll();

		return { procedures };
	},
};
