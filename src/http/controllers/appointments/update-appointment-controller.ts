import type { FastifyReply, FastifyRequest } from "fastify";
import { updateAppointmentUseCase } from "@/http/useCases/appointments/update-appointment-use-case";
import type {
	UpdateAppointmentBodySchema,
	UpdateAppointmentParamsSchema,
} from "@/schemas/routes/appointments/update-appointment";

export const updateAppointmentController = {
	async handle(
		request: FastifyRequest<{
			Params: UpdateAppointmentParamsSchema;
			Body: UpdateAppointmentBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const { id } = request.params;
		const data = request.body;

		const result = await updateAppointmentUseCase.execute(id, data);

		return reply.status(200).send(result);
	},
};
