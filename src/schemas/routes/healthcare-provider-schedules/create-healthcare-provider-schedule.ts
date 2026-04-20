import { z } from "zod";
import { healthcareProviderScheduleSchema } from "./get-healthcare-provider-schedules";

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

export const createHealthcareProviderScheduleBodySchema = z.object({
	healthcareProviderId: z.cuid(),
	dayOfWeek: z.number().int().min(0).max(6),
	startTime: z.string().regex(timeRegex, "Time must be in HH:mm format"),
	endTime: z.string().regex(timeRegex, "Time must be in HH:mm format"),
});

export const createHealthcareProviderScheduleResponseSchema = z.object({
	schedule: healthcareProviderScheduleSchema,
});

export type CreateHealthcareProviderScheduleBodySchema = z.infer<
	typeof createHealthcareProviderScheduleBodySchema
>;
export type CreateHealthcareProviderScheduleResponseSchema = z.infer<
	typeof createHealthcareProviderScheduleResponseSchema
>;

export const createHealthcareProviderScheduleRouteOptions = {
	schema: {
		tags: ["Healthcare Provider Schedules"],
		summary: "Create a new healthcare provider schedule",
		security: [{ bearerAuth: [] }],
		body: createHealthcareProviderScheduleBodySchema,
		response: {
			201: createHealthcareProviderScheduleResponseSchema,
		},
	},
};
