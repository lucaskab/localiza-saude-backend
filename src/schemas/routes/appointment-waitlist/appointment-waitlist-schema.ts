import { z } from "zod";
import {
	customerUserSchema,
	healthcareProviderUserSchema,
} from "../users/user";

const waitlistProcedureSchema = z.object({
	id: z.cuid(),
	waitlistEntryId: z.cuid(),
	procedureId: z.cuid(),
	procedure: z.object({
		id: z.cuid(),
		name: z.string(),
		description: z.string().nullable(),
		priceInCents: z.number().int(),
		durationInMinutes: z.number().int(),
		healthcareProviderId: z.cuid(),
		createdAt: z.date(),
		updatedAt: z.date(),
	}),
	createdAt: z.date(),
});

export const appointmentWaitlistEntrySchema = z.object({
	id: z.cuid(),
	customerId: z.cuid(),
	customer: customerUserSchema,
	healthcareProviderId: z.cuid(),
	healthcareProvider: healthcareProviderUserSchema,
	desiredScheduledAt: z.date(),
	status: z.enum(["ACTIVE", "CANCELLED"]),
	lastNotifiedAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	procedures: z.array(waitlistProcedureSchema),
});
