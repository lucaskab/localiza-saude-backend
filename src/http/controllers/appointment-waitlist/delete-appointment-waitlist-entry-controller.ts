import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteAppointmentWaitlistEntryUseCase } from "@/http/useCases/appointment-waitlist/delete-appointment-waitlist-entry-use-case";
import type { DeleteAppointmentWaitlistEntryParamsSchema } from "@/schemas/routes/appointment-waitlist/delete-appointment-waitlist-entry";

export const deleteAppointmentWaitlistEntryController = {
	async handle(
		request: FastifyRequest<{
			Params: DeleteAppointmentWaitlistEntryParamsSchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const { id } = request.params;

		await deleteAppointmentWaitlistEntryUseCase.execute(user, id);

		return reply.status(204).send();
	},
};
