import { z } from "zod";
import { healthcareProviderScheduleSchema } from "./get-healthcare-provider-schedules";

export const getSchedulesByProfessionalParamsSchema = z.object({
	healthcareProviderId: z.cuid(),
});

export const getSchedulesByProfessionalResponseSchema = z.object({
	schedules: z.array(healthcareProviderScheduleSchema),
});

export type GetSchedulesByProviderParamsSchema = z.infer<
	typeof getSchedulesByProfessionalParamsSchema
>;
export type GetSchedulesByProviderResponseSchema = z.infer<
	typeof getSchedulesByProfessionalResponseSchema
>;

export const getSchedulesByProfessionalRouteOptions = {
	schema: {
		tags: ["Healthcare Provider Schedules"],
		summary: "Get schedules by healthcare provider",
		params: getSchedulesByProfessionalParamsSchema,
		response: {
			200: getSchedulesByProfessionalResponseSchema,
		},
	},
};
