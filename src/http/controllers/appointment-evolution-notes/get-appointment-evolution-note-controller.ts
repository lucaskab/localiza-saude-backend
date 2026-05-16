import type { FastifyReply, FastifyRequest } from "fastify";
import { getAppointmentEvolutionNoteUseCase } from "@/http/useCases/appointment-evolution-notes/get-appointment-evolution-note-use-case";
import type { GetAppointmentEvolutionNoteParamsSchema } from "@/schemas/routes/appointment-evolution-notes/get-appointment-evolution-note";

export const getAppointmentEvolutionNoteController = {
	async handle(
		request: FastifyRequest<{
			Params: GetAppointmentEvolutionNoteParamsSchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const result = await getAppointmentEvolutionNoteUseCase.execute(
			request.params.appointmentId,
			user,
		);

		return reply.status(200).send(result);
	},
};
