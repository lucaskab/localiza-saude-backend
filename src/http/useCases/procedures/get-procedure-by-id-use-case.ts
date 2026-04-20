import { prismaProcedureRepository } from "@/http/repositories/procedures/procedures-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { procedure } from "../../../../prisma/generated/prisma/client";

export const getProcedureByIdUseCase = {
	async execute(id: string): Promise<{ procedure: procedure }> {
		const procedure = await prismaProcedureRepository.findById(id);

		if (!procedure) {
			throw new BadRequestError("Procedure not found");
		}

		return { procedure };
	},
};
