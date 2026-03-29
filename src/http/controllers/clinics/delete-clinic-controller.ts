import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteClinicUseCase } from "@/http/useCases/clinics/delete-clinic-use-case";
import type { DeleteClinicParamsSchema } from "@/schemas/routes/clinics/delete-clinic";

export const deleteClinicController = {
	async handle(
		request: FastifyRequest<{ Params: DeleteClinicParamsSchema }>,
		reply: FastifyReply,
	) {
		const { id } = request.params;

		const result = await deleteClinicUseCase.execute(id);

		return reply.status(200).send(result);
	},
};
