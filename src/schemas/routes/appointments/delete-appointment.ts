import { z } from "zod";

export const deleteAppointmentParamsSchema = z.object({
	id: z.cuid(),
});

export const deleteAppointmentResponseSchema = z.object({
	message: z.string(),
});

export type DeleteAppointmentParamsSchema = z.infer<
	typeof deleteAppointmentParamsSchema
>;
export type DeleteAppointmentResponseSchema = z.infer<
	typeof deleteAppointmentResponseSchema
>;

export const deleteAppointmentRouteOptions = {
	schema: {
		tags: ["Appointments"],
		summary: "Delete an appointment",
		security: [{ bearerAuth: [] }],
		params: deleteAppointmentParamsSchema,
		response: {
			200: deleteAppointmentResponseSchema,
		},
	},
};
