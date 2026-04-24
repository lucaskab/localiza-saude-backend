import { z } from "zod";

const userSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	email: z.string().email(),
	phone: z.string().nullable(),
	image: z.string().nullable(),
	role: z.string(),
});

const customerSchema = z.object({
	id: z.cuid(),
	userId: z.cuid(),
	user: userSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});

const healthcareProviderSchema = z.object({
	id: z.cuid(),
	userId: z.cuid(),
	user: userSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const ratingSchema = z.object({
	id: z.cuid(),
	customerId: z.string(),
	customer: customerSchema,
	healthcareProviderId: z.string(),
	healthcareProvider: healthcareProviderSchema,
	rating: z.number().int().min(1).max(10),
	comment: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const createRatingBodySchema = z.object({
	healthcareProviderId: z.cuid(),
	rating: z.number().int().min(1).max(10),
	comment: z.string().nullable().optional(),
});

export const createRatingResponseSchema = z.object({
	rating: ratingSchema,
});

export type CreateRatingBodySchema = z.infer<typeof createRatingBodySchema>;
export type CreateRatingResponseSchema = z.infer<
	typeof createRatingResponseSchema
>;

export const createRatingRouteOptions = {
	schema: {
		tags: ["Ratings"],
		summary: "Create a new rating",
		description:
			"Create a rating for a healthcare provider. Each customer can only rate a provider once.",
		security: [{ bearerAuth: [] }],
		body: createRatingBodySchema,
		response: {
			201: createRatingResponseSchema,
		},
	},
};
