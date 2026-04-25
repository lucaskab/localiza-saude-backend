import type { FastifyReply, FastifyRequest } from "fastify";
import { createAppointmentUseCase } from "@/http/useCases/appointments/create-appointment-use-case";
import type { CreateAppointmentBodySchema } from "@/schemas/routes/appointments/create-appointment";

export const createAppointmentController = {
	async handle(
		request: FastifyRequest<{ Body: CreateAppointmentBodySchema }>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();

		const result = await createAppointmentUseCase.execute(user, request.body);

		return reply.status(201).send(result);
	},
};
