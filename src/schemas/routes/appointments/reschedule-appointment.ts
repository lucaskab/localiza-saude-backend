import { z } from "zod";
import { appointmentSchema } from "./get-appointments";

export const rescheduleAppointmentParamsSchema = z.object({
	id: z.cuid(),
});

export const rescheduleAppointmentBodySchema = z.object({
	scheduledAt: z.iso.datetime().transform((value) => new Date(value)),
	reason: z.string().trim().max(500).nullable().optional(),
});

export const respondToRescheduleRequestParamsSchema = z.object({
	id: z.cuid(),
	requestId: z.cuid(),
});

export const respondToRescheduleRequestBodySchema = z.object({
	action: z.enum(["ACCEPT", "DECLINE"]),
});

export const rescheduleAppointmentResponseSchema = z.object({
	appointment: appointmentSchema,
});

export type RescheduleAppointmentParamsSchema = z.infer<
	typeof rescheduleAppointmentParamsSchema
>;
export type RescheduleAppointmentBodySchema = z.infer<
	typeof rescheduleAppointmentBodySchema
>;
export type RespondToRescheduleRequestParamsSchema = z.infer<
	typeof respondToRescheduleRequestParamsSchema
>;
export type RespondToRescheduleRequestBodySchema = z.infer<
	typeof respondToRescheduleRequestBodySchema
>;

export const rescheduleAppointmentRouteOptions = {
	schema: {
		tags: ["Appointments"],
		summary: "Request or apply an appointment reschedule",
		security: [{ bearerAuth: [] }],
		params: rescheduleAppointmentParamsSchema,
		body: rescheduleAppointmentBodySchema,
		response: {
			200: rescheduleAppointmentResponseSchema,
		},
	},
};

export const respondToRescheduleRequestRouteOptions = {
	schema: {
		tags: ["Appointments"],
		summary: "Accept or decline an appointment reschedule request",
		security: [{ bearerAuth: [] }],
		params: respondToRescheduleRequestParamsSchema,
		body: respondToRescheduleRequestBodySchema,
		response: {
			200: rescheduleAppointmentResponseSchema,
		},
	},
};
