import { z } from "zod";

const userSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	email: z.string().email(),
	phone: z.string().nullable(),
	image: z.string().nullable(),
	role: z.string(),
});

const procedureSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	description: z.string().nullable(),
	priceInCents: z.number().int(),
	durationInMinutes: z.number().int(),
	healthcareProviderId: z.cuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const healthcareProviderSchema = z.object({
	id: z.cuid(),
	userId: z.string(),
	specialty: z.string().nullable(),
	professionalId: z.string().nullable(),
	bio: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	user: userSchema,
	procedures: z.array(procedureSchema),
});

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
