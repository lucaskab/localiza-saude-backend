import { z } from "zod";
import { appointmentSchema, appointmentStatusSchema } from "./get-appointments";

export const updateAppointmentParamsSchema = z.object({
	id: z.cuid(),
});

export const updateAppointmentBodySchema = z.object({
	scheduledAt: z.iso
		.datetime()
		.transform((val) => new Date(val))
		.optional(),
	status: appointmentStatusSchema.optional(),
	notes: z.string().nullable().optional(),
});

export const updateAppointmentResponseSchema = z.object({
	appointment: appointmentSchema,
});

export type UpdateAppointmentParamsSchema = z.infer<
	typeof updateAppointmentParamsSchema
>;
export type UpdateAppointmentBodySchema = z.infer<
	typeof updateAppointmentBodySchema
>;
export type UpdateAppointmentResponseSchema = z.infer<
	typeof updateAppointmentResponseSchema
>;

export const updateAppointmentRouteOptions = {
	schema: {
		tags: ["Appointments"],
		summary: "Update an appointment",
		security: [{ bearerAuth: [] }],
		params: updateAppointmentParamsSchema,
		body: updateAppointmentBodySchema,
		response: {
			200: updateAppointmentResponseSchema,
		},
	},
};
