import { z } from "zod";
import {
	customerUserSchema,
	healthcareProviderUserSchema,
	publicUserSchema,
} from "../users/user";
import { serviceModalitySchema } from "@/schemas/service-modalities";

export const appointmentStatusSchema = z.enum([
	"SCHEDULED",
	"CONFIRMED",
	"IN_PROGRESS",
	"COMPLETED",
	"CANCELLED",
	"NO_SHOW",
]);

export const patientProfileSchema = z.object({
	id: z.cuid(),
	fullName: z.string(),
	dateOfBirth: z.date().nullable(),
	cpf: z.string().nullable(),
	phone: z.string().nullable(),
	email: z.string().nullable(),
	address: z.string().nullable(),
	gender: z.string().nullable(),
	relationshipToCustomer: z.string().nullable(),
	notes: z.string().nullable(),
	customerOwnerId: z.string().nullable(),
	createdByHealthcareProviderId: z.string().nullable(),
	bloodType: z.string().nullable(),
	medications: z.string().nullable(),
	chronicPain: z.string().nullable(),
	preExistingConditions: z.string().nullable(),
	allergies: z.string().nullable(),
	surgeries: z.string().nullable(),
	familyHistory: z.string().nullable(),
	lifestyleNotes: z.string().nullable(),
	emergencyContactName: z.string().nullable(),
	emergencyContactPhone: z.string().nullable(),
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

export const appointmentRescheduleRequestStatusSchema = z.enum([
	"PENDING",
	"ACCEPTED",
	"DECLINED",
	"CANCELLED",
]);

const appointmentRescheduleRequestSchema = z.object({
	id: z.cuid(),
	appointmentId: z.cuid(),
	requestedByUserId: z.cuid(),
	proposedScheduledAt: z.date(),
	status: appointmentRescheduleRequestStatusSchema,
	reason: z.string().nullable(),
	respondedAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const appointmentSchema = z.object({
	id: z.cuid(),
	customerId: z.cuid().nullable(),
	customer: customerUserSchema.nullable(),
	patientProfileId: z.cuid().nullable(),
	patientProfile: patientProfileSchema.nullable(),
	healthcareProviderId: z.cuid(),
	healthcareProvider: healthcareProviderUserSchema,
	scheduledAt: z.date(),
	status: appointmentStatusSchema,
	serviceModality: serviceModalitySchema,
	onlineMeetingUrl: z.string().nullable(),
	onlineMeetingProvider: z.string().nullable(),
	onlineMeetingExternalId: z.string().nullable(),
	onlineMeetingCreatedAt: z.date().nullable(),
	totalDurationMinutes: z.number().int(),
	totalPriceCents: z.number().int(),
	notes: z.string().nullable(),
	cancellationReason: z.string().nullable(),
	cancellationFeeCents: z.number().int().nullable(),
	cancellationPolicyAppliedAt: z.date().nullable(),
	cancelledAt: z.date().nullable(),
	cancelledByUserId: z.cuid().nullable(),
	cancelledByUser: publicUserSchema.nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	appointmentProcedures: z.array(appointmentProcedureSchema),
	rescheduleRequests: z.array(appointmentRescheduleRequestSchema),
});

export const getAppointmentsQuerySchema = z.object({
	customerId: z.cuid().optional(),
	healthcareProviderId: z.cuid().optional(),
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

export const getAppointmentsResponseSchema = z.object({
	appointments: z.array(appointmentSchema),
	total: z.number().int(),
	limit: z.number().int(),
	offset: z.number().int(),
	hasMore: z.boolean(),
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
			"Filter appointments by customer, healthcare provider, status, search text, and/or date range. Date range includes the entire day: startDate begins at 00:00:00 and endDate ends at 23:59:59.999. If both dates are the same (e.g., startDate=2026-04-05 and endDate=2026-04-05), it returns all appointments from that day.",
		security: [{ bearerAuth: [] }],
		querystring: getAppointmentsQuerySchema,
		response: {
			200: getAppointmentsResponseSchema,
		},
	},
};
