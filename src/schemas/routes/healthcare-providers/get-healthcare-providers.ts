import { z } from "zod";
import { healthcareProviderUserSchema } from "../users/user";
import { procedureSchema } from "../procedures/get-procedures";

const booleanQuerySchema = z
	.enum(["true", "false"])
	.transform((value) => value === "true");

export const getHealthcareProvidersQuerySchema = z.object({
	search: z.string().trim().optional(),
	specialty: z.string().trim().optional(),
	serviceModality: z.string().trim().optional(),
	language: z.string().trim().optional(),
	insurance: z.string().trim().optional(),
	verified: booleanQuerySchema.optional(),
	superProfessional: booleanQuerySchema.optional(),
	available: booleanQuerySchema.optional(),
	minRating: z.coerce.number().min(0).max(5).optional(),
	maxPriceCents: z.coerce.number().int().min(0).optional(),
	limit: z.coerce.number().int().min(1).max(50).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});

export const healthcareProviderSchema = healthcareProviderUserSchema.extend({
	procedures: z.array(procedureSchema),
});

export const getHealthcareProvidersResponseSchema = z.object({
	healthcareProviders: z.array(healthcareProviderSchema),
	total: z.number().int(),
	limit: z.number().int(),
	offset: z.number().int(),
	hasMore: z.boolean(),
});

export type GetHealthcareProvidersResponseSchema = z.infer<
	typeof getHealthcareProvidersResponseSchema
>;
export type GetHealthcareProvidersQuerySchema = z.infer<
	typeof getHealthcareProvidersQuerySchema
>;

export const getHealthcareProvidersRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Get all healthcare providers",
		querystring: getHealthcareProvidersQuerySchema,
		response: {
			200: getHealthcareProvidersResponseSchema,
		},
	},
};
