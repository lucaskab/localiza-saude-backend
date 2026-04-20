import { z } from "zod";

const userSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	email: z.string().email(),
	phone: z.string().nullable(),
	image: z.string().nullable(),
});

const healthcareProviderSchema = z.object({
	id: z.cuid(),
	userId: z.string(),
	specialty: z.string().nullable(),
	professionalId: z.string().nullable(),
	bio: z.string().nullable(),
	user: userSchema,
});

export const categorySchema = z.object({
	id: z.cuid(),
	name: z.string(),
	description: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	healthcareProviders: z.array(healthcareProviderSchema),
});

export const getCategoriesResponseSchema = z.object({
	categories: z.array(categorySchema),
});

export type GetCategoriesResponseSchema = z.infer<
	typeof getCategoriesResponseSchema
>;

export const getCategoriesRouteOptions = {
	schema: {
		tags: ["Categories"],
		summary: "Get all categories",
		security: [{ bearerAuth: [] }],
		response: {
			200: getCategoriesResponseSchema,
		},
	},
};
