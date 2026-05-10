import type { FastifyReply, FastifyRequest } from "fastify";
import { getAppointmentWaitlistEntryUseCase } from "@/http/useCases/appointment-waitlist/get-appointment-waitlist-entry-use-case";
import type { GetAppointmentWaitlistEntryQuerySchema } from "@/schemas/routes/appointment-waitlist/get-appointment-waitlist-entry";

export const getAppointmentWaitlistEntryController = {
	async handle(
		request: FastifyRequest<{
			Querystring: GetAppointmentWaitlistEntryQuerySchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const data = request.query;

		const result = await getAppointmentWaitlistEntryUseCase.execute(user, data);

		return reply.status(200).send(result);
	},
};
