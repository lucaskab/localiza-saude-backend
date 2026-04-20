import { z } from "zod";

export const deleteRatingParamsSchema = z.object({
	id: z.cuid(),
});

export const deleteRatingResponseSchema = z.object({
	message: z.string(),
});

export type DeleteRatingParamsSchema = z.infer<typeof deleteRatingParamsSchema>;
export type DeleteRatingResponseSchema = z.infer<
	typeof deleteRatingResponseSchema
>;

export const deleteRatingRouteOptions = {
	schema: {
		tags: ["Ratings"],
		summary: "Delete a rating",
		security: [{ bearerAuth: [] }],
		params: deleteRatingParamsSchema,
		response: {
			200: deleteRatingResponseSchema,
		},
	},
};
