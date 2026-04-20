import { prismaProcedureRepository } from "@/http/repositories/procedures/procedures-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const deleteProcedureUseCase = {
	async execute(id: string): Promise<{ message: string }> {
		const existingProcedure = await prismaProcedureRepository.findById(id);

		if (!existingProcedure) {
			throw new BadRequestError("Procedure not found");
		}

		await prismaProcedureRepository.delete(id);

		return { message: "Procedure deleted successfully" };
	},
};
