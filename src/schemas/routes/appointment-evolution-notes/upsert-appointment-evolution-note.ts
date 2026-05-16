import { appointmentEvolutionNoteBodySchema, appointmentEvolutionNoteResponseSchema } from "./appointment-evolution-note";
import { getAppointmentEvolutionNoteParamsSchema } from "./get-appointment-evolution-note";

export type UpsertAppointmentEvolutionNoteBodySchema =
	import("./appointment-evolution-note").AppointmentEvolutionNoteBodySchema;

export const upsertAppointmentEvolutionNoteRouteOptions = {
	schema: {
		tags: ["Appointment Evolution Notes"],
		summary: "Create or update the evolution note for an appointment",
		security: [{ bearerAuth: [] }],
		params: getAppointmentEvolutionNoteParamsSchema,
		body: appointmentEvolutionNoteBodySchema,
		response: {
			200: appointmentEvolutionNoteResponseSchema,
		},
	},
};
