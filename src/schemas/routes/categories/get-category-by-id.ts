import { z } from "zod";
import { categorySchema } from "./get-categories";

export const getCategoryByIdParamsSchema = z.object({
	id: z.cuid(),
});

export const getCategoryByIdResponseSchema = z.object({
	category: categorySchema,
});

export type GetCategoryByIdParamsSchema = z.infer<
	typeof getCategoryByIdParamsSchema
>;
export type GetCategoryByIdResponseSchema = z.infer<
	typeof getCategoryByIdResponseSchema
>;

export const getCategoryByIdRouteOptions = {
	schema: {
		tags: ["Categories"],
		summary: "Get category by ID",
		security: [{ bearerAuth: [] }],
		params: getCategoryByIdParamsSchema,
		response: {
			200: getCategoryByIdResponseSchema,
		},
	},
};
