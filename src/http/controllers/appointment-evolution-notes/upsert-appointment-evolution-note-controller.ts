import type { FastifyReply, FastifyRequest } from "fastify";
import { upsertAppointmentEvolutionNoteUseCase } from "@/http/useCases/appointment-evolution-notes/upsert-appointment-evolution-note-use-case";
import type { GetAppointmentEvolutionNoteParamsSchema } from "@/schemas/routes/appointment-evolution-notes/get-appointment-evolution-note";
import type { UpsertAppointmentEvolutionNoteBodySchema } from "@/schemas/routes/appointment-evolution-notes/upsert-appointment-evolution-note";

export const upsertAppointmentEvolutionNoteController = {
	async handle(
		request: FastifyRequest<{
			Params: GetAppointmentEvolutionNoteParamsSchema;
			Body: UpsertAppointmentEvolutionNoteBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const result = await upsertAppointmentEvolutionNoteUseCase.execute(
			request.params.appointmentId,
			user,
			request.body,
		);

		return reply.status(200).send(result);
	},
};
