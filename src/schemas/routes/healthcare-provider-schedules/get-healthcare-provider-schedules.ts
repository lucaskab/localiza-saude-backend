import { z } from "zod";
import { healthcareProviderUserSchema } from "../users/user";

export const healthcareProviderScheduleSchema = z.object({
	id: z.cuid(),
	healthcareProviderId: z.cuid(),
	healthcareProvider: healthcareProviderUserSchema,
	dayOfWeek: z.number().int().min(0).max(6),
	startTime: z.string(),
	endTime: z.string(),
	isActive: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const getHealthcareProviderSchedulesResponseSchema = z.object({
	schedules: z.array(healthcareProviderScheduleSchema),
});

export type GetHealthcareProviderSchedulesResponseSchema = z.infer<
	typeof getHealthcareProviderSchedulesResponseSchema
>;

export const getHealthcareProviderSchedulesRouteOptions = {
	schema: {
		tags: ["Healthcare Provider Schedules"],
		summary: "Get all healthcare provider schedules",
		response: {
			200: getHealthcareProviderSchedulesResponseSchema,
		},
	},
};
