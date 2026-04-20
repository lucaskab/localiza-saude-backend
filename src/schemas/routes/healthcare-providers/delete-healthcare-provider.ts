import { z } from "zod";

export const deleteHealthcareProviderParamsSchema = z.object({
	id: z.cuid(),
});

export const deleteHealthcareProviderResponseSchema = z.object({
	message: z.string(),
});

export type DeleteHealthcareProviderParamsSchema = z.infer<
	typeof deleteHealthcareProviderParamsSchema
>;
export type DeleteHealthcareProviderResponseSchema = z.infer<
	typeof deleteHealthcareProviderResponseSchema
>;

export const deleteHealthcareProviderRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Delete a healthcare provider",
		security: [{ bearerAuth: [] }],
		params: deleteHealthcareProviderParamsSchema,
		response: {
			200: deleteHealthcareProviderResponseSchema,
		},
	},
};
