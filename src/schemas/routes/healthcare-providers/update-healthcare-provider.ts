import { z } from "zod";
import { healthcareProviderSchema } from "./get-healthcare-providers";

export const updateHealthcareProviderParamsSchema = z.object({
	id: z.cuid(),
});

export const updateHealthcareProviderBodySchema = z.object({
	specialty: z.string().nullable().optional(),
	professionalId: z.string().nullable().optional(),
	bio: z.string().nullable().optional(),
});

export const updateHealthcareProviderResponseSchema = z.object({
	healthcareProvider: healthcareProviderSchema,
});

export type UpdateHealthcareProviderParamsSchema = z.infer<
	typeof updateHealthcareProviderParamsSchema
>;
export type UpdateHealthcareProviderBodySchema = z.infer<
	typeof updateHealthcareProviderBodySchema
>;
export type UpdateHealthcareProviderResponseSchema = z.infer<
	typeof updateHealthcareProviderResponseSchema
>;

export const updateHealthcareProviderRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Update a healthcare provider",
		security: [{ bearerAuth: [] }],
		params: updateHealthcareProviderParamsSchema,
		body: updateHealthcareProviderBodySchema,
		response: {
			200: updateHealthcareProviderResponseSchema,
		},
	},
};
