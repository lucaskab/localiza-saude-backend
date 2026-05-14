import { z } from "zod";
import { appointmentRecurrenceSchema } from "@/schemas/routes/appointments/create-appointment";

export const updateAppointmentRecurringSeriesParamsSchema = z.object({
	id: z.cuid(),
});

export const updateAppointmentRecurringSeriesBodySchema = z.object({
	notes: z.string().trim().nullable().optional(),
	recurrence: appointmentRecurrenceSchema,
});

export const recurringSeriesWeeklySlotSchema = z.object({
	id: z.cuid(),
	dayOfWeek: z.number().int(),
	startTime: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const recurringSeriesSummarySchema = z.object({
	id: z.cuid(),
	customerId: z.cuid().nullable(),
	patientProfileId: z.cuid().nullable(),
	healthcareProviderId: z.cuid(),
	createdByUserId: z.cuid(),
	serviceModality: z.string(),
	notes: z.string().nullable(),
	startsOn: z.date(),
	endsOn: z.date().nullable(),
	isIndefinite: z.boolean(),
	isActive: z.boolean(),
	generatedUntil: z.date().nullable(),
	cancelledAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	weeklySlots: z.array(recurringSeriesWeeklySlotSchema),
});

export const updateAppointmentRecurringSeriesResponseSchema = z.object({
	recurringSeries: recurringSeriesSummarySchema,
});

export type UpdateAppointmentRecurringSeriesParamsSchema = z.infer<
	typeof updateAppointmentRecurringSeriesParamsSchema
>;
export type UpdateAppointmentRecurringSeriesBodySchema = z.infer<
	typeof updateAppointmentRecurringSeriesBodySchema
>;

export const updateAppointmentRecurringSeriesRouteOptions = {
	schema: {
		tags: ["Appointments"],
		summary: "Update a recurring appointment series",
		security: [{ bearerAuth: [] }],
		params: updateAppointmentRecurringSeriesParamsSchema,
		body: updateAppointmentRecurringSeriesBodySchema,
		response: {
			200: updateAppointmentRecurringSeriesResponseSchema,
		},
	},
};
