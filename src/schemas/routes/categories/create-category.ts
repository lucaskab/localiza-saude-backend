import { z } from "zod";
import { categorySchema } from "./get-categories";

export const createCategoryBodySchema = z.object({
	name: z.string().min(1),
	description: z.string().nullable().optional(),
});

export const createCategoryResponseSchema = z.object({
	category: categorySchema,
});

export type CreateCategoryBodySchema = z.infer<typeof createCategoryBodySchema>;
export type CreateCategoryResponseSchema = z.infer<
	typeof createCategoryResponseSchema
>;

export const createCategoryRouteOptions = {
	schema: {
		tags: ["Categories"],
		summary: "Create a new category",
		security: [{ bearerAuth: [] }],
		body: createCategoryBodySchema,
		response: {
			201: createCategoryResponseSchema,
		},
	},
};
