import { z } from "zod";
import { appointmentEvolutionNoteResponseSchema } from "./appointment-evolution-note";

export const getAppointmentEvolutionNoteParamsSchema = z.object({
	appointmentId: z.cuid(),
});

export type GetAppointmentEvolutionNoteParamsSchema = z.infer<
	typeof getAppointmentEvolutionNoteParamsSchema
>;

export const getAppointmentEvolutionNoteRouteOptions = {
	schema: {
		tags: ["Appointment Evolution Notes"],
		summary: "Get the evolution note and note history for an appointment",
		security: [{ bearerAuth: [] }],
		params: getAppointmentEvolutionNoteParamsSchema,
		response: {
			200: appointmentEvolutionNoteResponseSchema,
		},
	},
};
