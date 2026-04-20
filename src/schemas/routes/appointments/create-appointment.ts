import { z } from "zod";
import { appointmentSchema } from "./get-appointments";

export const createAppointmentBodySchema = z.object({
	healthcareProviderId: z.cuid(),
	scheduledAt: z.string().datetime().transform((val) => new Date(val)),
	procedureIds: z.array(z.cuid()).min(1),
	notes: z.string().nullable().optional(),
});

export const createAppointmentResponseSchema = z.object({
	appointment: appointmentSchema,
});

export type CreateAppointmentBodySchema = z.infer<
	typeof createAppointmentBodySchema
>;
export type CreateAppointmentResponseSchema = z.infer<
	typeof createAppointmentResponseSchema
>;

export const createAppointmentRouteOptions = {
	schema: {
		tags: ["Appointments"],
		summary: "Create a new appointment",
		security: [{ bearerAuth: [] }],
		body: createAppointmentBodySchema,
		response: {
			201: createAppointmentResponseSchema,
		},
	},
};
