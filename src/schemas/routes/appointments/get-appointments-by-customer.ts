import { z } from "zod";
import { appointmentSchema } from "./get-appointments";

export const getAppointmentsByCustomerParamsSchema = z.object({
	customerId: z.cuid(),
});

export const getAppointmentsByCustomerResponseSchema = z.object({
	appointments: z.array(appointmentSchema),
});

export type GetAppointmentsByCustomerParamsSchema = z.infer<
	typeof getAppointmentsByCustomerParamsSchema
>;
export type GetAppointmentsByCustomerResponseSchema = z.infer<
	typeof getAppointmentsByCustomerResponseSchema
>;

export const getAppointmentsByCustomerRouteOptions = {
	schema: {
		tags: ["Appointments"],
		summary: "Get appointments by customer",
		security: [{ bearerAuth: [] }],
		params: getAppointmentsByCustomerParamsSchema,
		response: {
			200: getAppointmentsByCustomerResponseSchema,
		},
	},
};
