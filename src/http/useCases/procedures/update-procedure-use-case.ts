import type { UpdateProcedureData } from "@/http/repositories/procedures/procedures-repository-contract";
import { prismaProcedureRepository } from "@/http/repositories/procedures/procedures-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { procedure } from "../../../../prisma/generated/prisma/client";

export const updateProcedureUseCase = {
	async execute(
		id: string,
		data: UpdateProcedureData,
	): Promise<{ procedure: procedure }> {
		const existingProcedure = await prismaProcedureRepository.findById(id);

		if (!existingProcedure) {
			throw new BadRequestError("Procedure not found");
		}

		const procedure = await prismaProcedureRepository.update(id, data);

		return { procedure };
	},
};
