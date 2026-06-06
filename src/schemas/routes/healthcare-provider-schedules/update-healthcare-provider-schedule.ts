import { z } from "zod";
import { healthcareProviderScheduleSchema } from "./get-healthcare-provider-schedules";

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

export const updateHealthcareProviderScheduleParamsSchema = z.object({
	id: z.cuid(),
});

export const updateHealthcareProviderScheduleBodySchema = z.object({
	dayOfWeek: z.number().int().min(0).max(6).optional(),
	startTime: z
		.string()
		.regex(timeRegex, "Time must be in HH:mm format")
		.optional(),
	endTime: z
		.string()
		.regex(timeRegex, "Time must be in HH:mm format")
		.optional(),
	isActive: z.boolean().optional(),
});

export const updateHealthcareProviderScheduleResponseSchema = z.object({
	schedule: healthcareProviderScheduleSchema,
});

export type UpdateHealthcareProviderScheduleParamsSchema = z.infer<
	typeof updateHealthcareProviderScheduleParamsSchema
>;
export type UpdateHealthcareProviderScheduleBodySchema = z.infer<
	typeof updateHealthcareProviderScheduleBodySchema
>;
export type UpdateHealthcareProviderScheduleResponseSchema = z.infer<
	typeof updateHealthcareProviderScheduleResponseSchema
>;

export const updateHealthcareProviderScheduleRouteOptions = {
	schema: {
		tags: ["Healthcare Provider Schedules"],
		summary: "Update a healthcare provider schedule",
		security: [{ bearerAuth: [] }],
		params: updateHealthcareProviderScheduleParamsSchema,
		body: updateHealthcareProviderScheduleBodySchema,
		response: {
			200: updateHealthcareProviderScheduleResponseSchema,
		},
	},
};
