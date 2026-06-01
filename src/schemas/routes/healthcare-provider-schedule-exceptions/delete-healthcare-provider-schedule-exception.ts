import { z } from "zod";

export const deleteHealthcareProviderScheduleExceptionParamsSchema = z.object({
	id: z.string().trim().min(1),
});

export type DeleteHealthcareProviderScheduleExceptionParamsSchema = z.infer<
	typeof deleteHealthcareProviderScheduleExceptionParamsSchema
>;

export const deleteHealthcareProviderScheduleExceptionRouteOptions = {
	schema: {
		tags: ["Healthcare Provider Schedule Exceptions"],
		summary: "Delete a healthcare provider schedule exception",
		security: [{ bearerAuth: [] }],
		params: deleteHealthcareProviderScheduleExceptionParamsSchema,
		response: {
			204: z.null(),
		},
	},
};
