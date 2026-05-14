import { z } from "zod";

export const deleteAppointmentRecurringSeriesParamsSchema = z.object({
	id: z.cuid(),
});

export const deleteAppointmentRecurringSeriesResponseSchema = z.object({
	message: z.string(),
});

export type DeleteAppointmentRecurringSeriesParamsSchema = z.infer<
	typeof deleteAppointmentRecurringSeriesParamsSchema
>;

export const deleteAppointmentRecurringSeriesRouteOptions = {
	schema: {
		tags: ["Appointments"],
		summary: "Cancel a recurring appointment series",
		security: [{ bearerAuth: [] }],
		params: deleteAppointmentRecurringSeriesParamsSchema,
		response: {
			200: deleteAppointmentRecurringSeriesResponseSchema,
		},
	},
};
