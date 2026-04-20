import { z } from "zod";
import { healthcareProviderSchema } from "./get-healthcare-providers";

export const getHealthcareProviderByIdParamsSchema = z.object({
	id: z.cuid(),
});

export const getHealthcareProviderByIdResponseSchema = z.object({
	healthcareProvider: healthcareProviderSchema,
});

export type GetHealthcareProviderByIdParamsSchema = z.infer<
	typeof getHealthcareProviderByIdParamsSchema
>;
export type GetHealthcareProviderByIdResponseSchema = z.infer<
	typeof getHealthcareProviderByIdResponseSchema
>;

export const getHealthcareProviderByIdRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Get healthcare provider by ID",
		params: getHealthcareProviderByIdParamsSchema,
		response: {
			200: getHealthcareProviderByIdResponseSchema,
		},
	},
};
