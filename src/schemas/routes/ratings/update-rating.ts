import { z } from "zod";
import { ratingSchema } from "./create-rating";

export const updateRatingParamsSchema = z.object({
	id: z.cuid(),
});

export const updateRatingBodySchema = z.object({
	rating: z.number().int().min(1).max(10).optional(),
	comment: z.string().nullable().optional(),
});

export const updateRatingResponseSchema = z.object({
	rating: ratingSchema,
});

export type UpdateRatingParamsSchema = z.infer<typeof updateRatingParamsSchema>;
export type UpdateRatingBodySchema = z.infer<typeof updateRatingBodySchema>;
export type UpdateRatingResponseSchema = z.infer<
	typeof updateRatingResponseSchema
>;

export const updateRatingRouteOptions = {
	schema: {
		tags: ["Ratings"],
		summary: "Update a rating",
		description: "Update an existing rating's score and/or comment",
		security: [{ bearerAuth: [] }],
		params: updateRatingParamsSchema,
		body: updateRatingBodySchema,
		response: {
			200: updateRatingResponseSchema,
		},
	},
};
