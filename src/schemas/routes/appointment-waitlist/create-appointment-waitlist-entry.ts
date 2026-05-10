import { z } from "zod";
import { appointmentWaitlistEntrySchema } from "./appointment-waitlist-schema";

export const createAppointmentWaitlistEntryBodySchema = z.object({
	healthcareProviderId: z.cuid(),
	scheduledAt: z.coerce.date(),
	procedureIds: z.array(z.cuid()).min(1),
});

export const createAppointmentWaitlistEntryResponseSchema = z.object({
	waitlistEntry: appointmentWaitlistEntrySchema,
});

export type CreateAppointmentWaitlistEntryBodySchema = z.infer<
	typeof createAppointmentWaitlistEntryBodySchema
>;

export const createAppointmentWaitlistEntryRouteOptions = {
	schema: {
		tags: ["Appointment Waitlist"],
		summary: "Join the waitlist for a specific provider slot",
		security: [{ bearerAuth: [] }],
		body: createAppointmentWaitlistEntryBodySchema,
		response: {
			201: createAppointmentWaitlistEntryResponseSchema,
		},
	},
};
