import { z } from "zod";
import { healthcareProviderUserSchema } from "../users/user";

export const categorySchema = z.object({
	id: z.cuid(),
	name: z.string(),
	description: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	healthcareProviders: z.array(healthcareProviderUserSchema),
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
