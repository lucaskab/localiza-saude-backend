import { z } from "zod";
import { healthcareProviderSchema } from "./get-healthcare-providers";

export const createHealthcareProviderBodySchema = z.object({
	userId: z.cuid(),
	specialty: z.string().nullable().optional(),
	professionalId: z.string().nullable().optional(),
	bio: z.string().nullable().optional(),
});

export const createHealthcareProviderResponseSchema = z.object({
	healthcareProvider: healthcareProviderSchema,
});

export type CreateHealthcareProviderBodySchema = z.infer<
	typeof createHealthcareProviderBodySchema
>;
export type CreateHealthcareProviderResponseSchema = z.infer<
	typeof createHealthcareProviderResponseSchema
>;

export const createHealthcareProviderRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Create a new healthcare provider profile",
		security: [{ bearerAuth: [] }],
		body: createHealthcareProviderBodySchema,
		response: {
			201: createHealthcareProviderResponseSchema,
		},
	},
};
