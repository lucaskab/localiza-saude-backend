import { z } from "zod";

export const appointmentStatusSchema = z.enum([
	"SCHEDULED",
	"CONFIRMED",
	"IN_PROGRESS",
	"COMPLETED",
	"CANCELLED",
	"NO_SHOW",
]);

const userSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	email: z.string().email(),
	phone: z.string().nullable(),
	image: z.string().nullable(),
	role: z.string(),
});

const customerSchema = z.object({
	id: z.cuid(),
	userId: z.cuid(),
	user: userSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});

const healthcareProviderSchema = z.object({
	id: z.cuid(),
	userId: z.cuid(),
	specialty: z.string().nullable(),
	professionalId: z.string().nullable(),
	user: userSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});

const procedureSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	description: z.string().nullable(),
	priceInCents: z.number().int(),
	durationInMinutes: z.number().int(),
	healthcareProviderId: z.cuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const appointmentProcedureSchema = z.object({
	id: z.cuid(),
	appointmentId: z.cuid(),
	procedureId: z.cuid(),
	procedure: procedureSchema,
	createdAt: z.date(),
});

export const appointmentSchema = z.object({
	id: z.cuid(),
	customerId: z.cuid(),
	customer: customerSchema,
	healthcareProviderId: z.cuid(),
	healthcareProvider: healthcareProviderSchema,
	scheduledAt: z.date(),
	status: appointmentStatusSchema,
	totalDurationMinutes: z.number().int(),
	totalPriceCents: z.number().int(),
	notes: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	appointmentProcedures: z.array(appointmentProcedureSchema),
});

export const getAppointmentsQuerySchema = z.object({
	healthcareProviderId: z.cuid().optional(),
	startDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
	endDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
});

export const getAppointmentsResponseSchema = z.object({
	appointments: z.array(appointmentSchema),
});

export type GetAppointmentsQuerySchema = z.infer<
	typeof getAppointmentsQuerySchema
>;

export type GetAppointmentsResponseSchema = z.infer<
	typeof getAppointmentsResponseSchema
>;

export const getAppointmentsRouteOptions = {
	schema: {
		tags: ["Appointments"],
		summary: "Get all appointments with optional filters",
		description:
			"Filter appointments by healthcare provider ID and/or date range. Date range includes the entire day: startDate begins at 00:00:00 and endDate ends at 23:59:59.999. If both dates are the same (e.g., startDate=2026-04-05 and endDate=2026-04-05), it returns all appointments from that day.",
		security: [{ bearerAuth: [] }],
		querystring: getAppointmentsQuerySchema,
		response: {
			200: getAppointmentsResponseSchema,
		},
	},
};
