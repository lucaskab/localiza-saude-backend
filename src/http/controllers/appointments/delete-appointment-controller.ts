import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteAppointmentUseCase } from "@/http/useCases/appointments/delete-appointment-use-case";
import type { DeleteAppointmentParamsSchema } from "@/schemas/routes/appointments/delete-appointment";

export const deleteAppointmentController = {
	async handle(
		request: FastifyRequest<{ Params: DeleteAppointmentParamsSchema }>,
		reply: FastifyReply,
	) {
		const { id } = request.params;

		const result = await deleteAppointmentUseCase.execute(id);

		return reply.status(200).send(result);
	},
};
