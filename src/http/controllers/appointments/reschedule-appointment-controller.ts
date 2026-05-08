import type { FastifyReply, FastifyRequest } from "fastify";
import { rescheduleAppointmentUseCase } from "@/http/useCases/appointments/reschedule-appointment-use-case";
import type {
	RescheduleAppointmentBodySchema,
	RescheduleAppointmentParamsSchema,
	RespondToRescheduleRequestBodySchema,
	RespondToRescheduleRequestParamsSchema,
} from "@/schemas/routes/appointments/reschedule-appointment";

export const rescheduleAppointmentController = {
	async request(
		request: FastifyRequest<{
			Params: RescheduleAppointmentParamsSchema;
			Body: RescheduleAppointmentBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const currentUser = await request.getCurrentUser();
		const result = await rescheduleAppointmentUseCase.request(
			request.params.id,
			currentUser,
			request.body,
		);

		return reply.status(200).send(result);
	},

	async respond(
		request: FastifyRequest<{
			Params: RespondToRescheduleRequestParamsSchema;
			Body: RespondToRescheduleRequestBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const currentUser = await request.getCurrentUser();
		const result = await rescheduleAppointmentUseCase.respond(
			request.params.id,
			request.params.requestId,
			currentUser,
			request.body,
		);

		return reply.status(200).send(result);
	},
};
