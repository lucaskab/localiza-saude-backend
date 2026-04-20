import { z } from "zod";
import { appointmentSchema } from "./get-appointments";

export const getAppointmentByIdParamsSchema = z.object({
	id: z.cuid(),
});

export const getAppointmentByIdResponseSchema = z.object({
	appointment: appointmentSchema,
});

export type GetAppointmentByIdParamsSchema = z.infer<
	typeof getAppointmentByIdParamsSchema
>;
export type GetAppointmentByIdResponseSchema = z.infer<
	typeof getAppointmentByIdResponseSchema
>;

export const getAppointmentByIdRouteOptions = {
	schema: {
		tags: ["Appointments"],
		summary: "Get appointment by ID",
		security: [{ bearerAuth: [] }],
		params: getAppointmentByIdParamsSchema,
		response: {
			200: getAppointmentByIdResponseSchema,
		},
	},
};
