import type { FastifyReply, FastifyRequest } from "fastify";
import { sendDueAppointmentRemindersUseCase } from "@/http/useCases/notifications/send-due-appointment-reminders-use-case";

export const sendDueAppointmentRemindersController = {
	async handle(_request: FastifyRequest, reply: FastifyReply) {
		const result = await sendDueAppointmentRemindersUseCase.execute();

		return reply.status(200).send(result);
	},
};
