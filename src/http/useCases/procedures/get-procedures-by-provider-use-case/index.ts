import { prismaProcedureRepository } from "@/http/repositories/procedures/procedures-repository-implementation";
import type { ProcedureWithChecklist } from "@/http/repositories/procedures/procedures-repository-contract";

export const getProceduresByProviderUseCase = {
	async execute(
		healthcareProviderId: string,
	): Promise<{ procedures: ProcedureWithChecklist[] }> {
		const procedures =
			await prismaProcedureRepository.findByHealthcareProviderId(
				healthcareProviderId,
			);

		return { procedures };
	},
};
