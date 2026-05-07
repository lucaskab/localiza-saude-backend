import { z } from "zod";
import { healthcareProviderSchema } from "./get-healthcare-providers";

export const getHealthcareProviderByUserIdParamsSchema = z.object({
	userId: z.string(),
});

export const getHealthcareProviderByUserIdResponseSchema = z.object({
	healthcareProvider: healthcareProviderSchema,
});

export type GetHealthcareProviderByUserIdParamsSchema = z.infer<
	typeof getHealthcareProviderByUserIdParamsSchema
>;
export type GetHealthcareProviderByUserIdResponseSchema = z.infer<
	typeof getHealthcareProviderByUserIdResponseSchema
>;

export const getHealthcareProviderByUserIdRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Get healthcare provider by user ID",
		security: [{ bearerAuth: [] }],
		params: getHealthcareProviderByUserIdParamsSchema,
		response: {
			200: getHealthcareProviderByUserIdResponseSchema,
		},
	},
};
