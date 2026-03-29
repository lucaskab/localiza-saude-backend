import type { FastifyReply, FastifyRequest } from "fastify";
import { getClinicByIdUseCase } from "@/http/useCases/clinics/get-clinic-by-id-use-case";
import type { GetClinicByIdParamsSchema } from "@/schemas/routes/clinics/get-clinic-by-id";

export const getClinicByIdController = {
	async handle(
		request: FastifyRequest<{ Params: GetClinicByIdParamsSchema }>,
		reply: FastifyReply,
	) {
		const { id } = request.params;

		const result = await getClinicByIdUseCase.execute(id);

		return reply.status(200).send(result);
	},
};
