import { z } from "zod";
import { categorySchema } from "./get-categories";

export const updateCategoryParamsSchema = z.object({
	id: z.cuid(),
});

export const updateCategoryBodySchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().nullable().optional(),
});

export const updateCategoryResponseSchema = z.object({
	category: categorySchema,
});

export type UpdateCategoryParamsSchema = z.infer<
	typeof updateCategoryParamsSchema
>;
export type UpdateCategoryBodySchema = z.infer<typeof updateCategoryBodySchema>;
export type UpdateCategoryResponseSchema = z.infer<
	typeof updateCategoryResponseSchema
>;

export const updateCategoryRouteOptions = {
	schema: {
		tags: ["Categories"],
		summary: "Update a category",
		security: [{ bearerAuth: [] }],
		params: updateCategoryParamsSchema,
		body: updateCategoryBodySchema,
		response: {
			200: updateCategoryResponseSchema,
		},
	},
};
