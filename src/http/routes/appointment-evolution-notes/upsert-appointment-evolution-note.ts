import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { upsertAppointmentEvolutionNoteController } from "@/http/controllers/appointment-evolution-notes/upsert-appointment-evolution-note-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { upsertAppointmentEvolutionNoteRouteOptions } from "@/schemas/routes/appointment-evolution-notes/upsert-appointment-evolution-note";

const upsertAppointmentEvolutionNote = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.put(
			"/appointments/:appointmentId/evolution-note",
			upsertAppointmentEvolutionNoteRouteOptions,
			upsertAppointmentEvolutionNoteController.handle,
		);
};

export default upsertAppointmentEvolutionNote;
