import { z } from "zod";
import { healthcareProviderScheduleSchema } from "./get-healthcare-provider-schedules";

export const getSchedulesByProviderParamsSchema = z.object({
	healthcareProviderId: z.cuid(),
});

export const getSchedulesByProviderResponseSchema = z.object({
	schedules: z.array(healthcareProviderScheduleSchema),
});

export type GetSchedulesByProviderParamsSchema = z.infer<
	typeof getSchedulesByProviderParamsSchema
>;
export type GetSchedulesByProviderResponseSchema = z.infer<
	typeof getSchedulesByProviderResponseSchema
>;

export const getSchedulesByProviderRouteOptions = {
	schema: {
		tags: ["Healthcare Provider Schedules"],
		summary: "Get schedules by healthcare provider",
		params: getSchedulesByProviderParamsSchema,
		response: {
			200: getSchedulesByProviderResponseSchema,
		},
	},
};
