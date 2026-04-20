import { prismaProcedureRepository } from "@/http/repositories/procedures/procedures-repository-implementation";
import type { procedure } from "../../../../prisma/generated/prisma/client";

export const getProceduresByProviderUseCase = {
	async execute(
		healthcareProviderId: string,
	): Promise<{ procedures: procedure[] }> {
		const procedures =
			await prismaProcedureRepository.findByHealthcareProviderId(
				healthcareProviderId,
			);

		return { procedures };
	},
};
