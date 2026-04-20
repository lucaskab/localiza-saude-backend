import { prismaProcedureRepository } from "@/http/repositories/procedures/procedures-repository-implementation";
import type { procedure } from "../../../../prisma/generated/prisma/client";

export const getProceduresUseCase = {
	async execute(): Promise<{
		procedures: procedure[];
	}> {
		const procedures = await prismaProcedureRepository.findAll();

		return { procedures };
	},
};
