import type { CreateProcedureData } from "@/http/repositories/procedures/procedures-repository-contract";
import { prismaProcedureRepository } from "@/http/repositories/procedures/procedures-repository-implementation";
import type { procedure } from "../../../../prisma/generated/prisma/client";

export const createProcedureUseCase = {
	async execute(data: CreateProcedureData): Promise<{ procedure: procedure }> {
		const procedure = await prismaProcedureRepository.create(data);

		return { procedure };
	},
};
