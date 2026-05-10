import type { FastifyReply, FastifyRequest } from "fastify";
import { createAppointmentWaitlistEntryUseCase } from "@/http/useCases/appointment-waitlist/create-appointment-waitlist-entry-use-case";
import type { CreateAppointmentWaitlistEntryBodySchema } from "@/schemas/routes/appointment-waitlist/create-appointment-waitlist-entry";

export const createAppointmentWaitlistEntryController = {
	async handle(
		request: FastifyRequest<{
			Body: CreateAppointmentWaitlistEntryBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const data = request.body;

		const result = await createAppointmentWaitlistEntryUseCase.execute(user, data);

		return reply.status(201).send(result);
	},
};
