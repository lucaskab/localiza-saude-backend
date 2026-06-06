import { z } from "zod";

export const deleteHealthcareProviderScheduleParamsSchema = z.object({
	id: z.cuid(),
});

export type DeleteHealthcareProviderScheduleParamsSchema = z.infer<
	typeof deleteHealthcareProviderScheduleParamsSchema
>;

export const deleteHealthcareProviderScheduleRouteOptions = {
	schema: {
		tags: ["Healthcare Provider Schedules"],
		summary: "Delete a healthcare provider schedule",
		security: [{ bearerAuth: [] }],
		params: deleteHealthcareProviderScheduleParamsSchema,
		response: {
			204: z.void(),
		},
	},
};
