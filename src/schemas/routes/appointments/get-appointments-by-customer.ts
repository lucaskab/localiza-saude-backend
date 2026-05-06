import { z } from "zod";
import {
	appointmentSchema,
	appointmentStatusSchema,
} from "./get-appointments";

export const getAppointmentsByCustomerParamsSchema = z.object({
	customerId: z.cuid(),
});

export const getAppointmentsByCustomerQuerySchema = z.object({
	status: appointmentStatusSchema.optional(),
	search: z.string().trim().optional(),
	startDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
	endDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
	limit: z.coerce.number().int().min(1).max(50).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});

export const getAppointmentsByCustomerResponseSchema = z.object({
	appointments: z.array(appointmentSchema),
	total: z.number().int(),
	limit: z.number().int(),
	offset: z.number().int(),
	hasMore: z.boolean(),
});

export type GetAppointmentsByCustomerParamsSchema = z.infer<
	typeof getAppointmentsByCustomerParamsSchema
>;
export type GetAppointmentsByCustomerQuerySchema = z.infer<
	typeof getAppointmentsByCustomerQuerySchema
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
		querystring: getAppointmentsByCustomerQuerySchema,
		response: {
			200: getAppointmentsByCustomerResponseSchema,
		},
	},
};
