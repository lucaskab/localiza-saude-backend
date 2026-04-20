import type { FastifyReply, FastifyRequest } from "fastify";
import { getAppointmentByIdUseCase } from "@/http/useCases/appointments/get-appointment-by-id-use-case";
import type { GetAppointmentByIdParamsSchema } from "@/schemas/routes/appointments/get-appointment-by-id";

export const getAppointmentByIdController = {
	async handle(
		request: FastifyRequest<{ Params: GetAppointmentByIdParamsSchema }>,
		reply: FastifyReply,
	) {
		const { id } = request.params;

		const result = await getAppointmentByIdUseCase.execute(id);

		return reply.status(200).send(result);
	},
};
