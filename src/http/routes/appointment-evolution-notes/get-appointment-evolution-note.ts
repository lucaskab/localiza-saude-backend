import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getAppointmentEvolutionNoteController } from "@/http/controllers/appointment-evolution-notes/get-appointment-evolution-note-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getAppointmentEvolutionNoteRouteOptions } from "@/schemas/routes/appointment-evolution-notes/get-appointment-evolution-note";

const getAppointmentEvolutionNote = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/appointments/:appointmentId/evolution-note",
			getAppointmentEvolutionNoteRouteOptions,
			getAppointmentEvolutionNoteController.handle,
		);
};

export default getAppointmentEvolutionNote;
