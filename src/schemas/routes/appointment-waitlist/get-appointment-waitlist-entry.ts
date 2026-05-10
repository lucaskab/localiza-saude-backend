import { z } from "zod";
import { appointmentWaitlistEntrySchema } from "./appointment-waitlist-schema";

export const getAppointmentWaitlistEntryQuerySchema = z.object({
	healthcareProviderId: z.cuid(),
	scheduledAt: z.coerce.date(),
});

export const getAppointmentWaitlistEntryResponseSchema = z.object({
	waitlistEntry: appointmentWaitlistEntrySchema.nullable(),
});

export type GetAppointmentWaitlistEntryQuerySchema = z.infer<
	typeof getAppointmentWaitlistEntryQuerySchema
>;

export const getAppointmentWaitlistEntryRouteOptions = {
	schema: {
		tags: ["Appointment Waitlist"],
		summary: "Get current user's waitlist entry for a provider slot",
		security: [{ bearerAuth: [] }],
		querystring: getAppointmentWaitlistEntryQuerySchema,
		response: {
			200: getAppointmentWaitlistEntryResponseSchema,
		},
	},
};
