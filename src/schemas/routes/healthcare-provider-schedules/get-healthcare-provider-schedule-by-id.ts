import { z } from "zod";
import { healthcareProviderScheduleSchema } from "./get-healthcare-provider-schedules";

export const getHealthcareProviderScheduleByIdParamsSchema = z.object({
	id: z.cuid(),
});

export const getHealthcareProviderScheduleByIdResponseSchema = z.object({
	schedule: healthcareProviderScheduleSchema,
});

export type GetHealthcareProviderScheduleByIdParamsSchema = z.infer<
	typeof getHealthcareProviderScheduleByIdParamsSchema
>;
export type GetHealthcareProviderScheduleByIdResponseSchema = z.infer<
	typeof getHealthcareProviderScheduleByIdResponseSchema
>;

export const getHealthcareProviderScheduleByIdRouteOptions = {
	schema: {
		tags: ["Healthcare Provider Schedules"],
		summary: "Get a healthcare provider schedule by ID",
		params: getHealthcareProviderScheduleByIdParamsSchema,
		response: {
			200: getHealthcareProviderScheduleByIdResponseSchema,
		},
	},
};
