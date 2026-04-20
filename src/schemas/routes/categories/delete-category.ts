import { z } from "zod";

export const deleteCategoryParamsSchema = z.object({
	id: z.cuid(),
});

export const deleteCategoryResponseSchema = z.object({
	message: z.string(),
});

export type DeleteCategoryParamsSchema = z.infer<
	typeof deleteCategoryParamsSchema
>;
export type DeleteCategoryResponseSchema = z.infer<
	typeof deleteCategoryResponseSchema
>;

export const deleteCategoryRouteOptions = {
	schema: {
		tags: ["Categories"],
		summary: "Delete a category",
		security: [{ bearerAuth: [] }],
		params: deleteCategoryParamsSchema,
		response: {
			200: deleteCategoryResponseSchema,
		},
	},
};
