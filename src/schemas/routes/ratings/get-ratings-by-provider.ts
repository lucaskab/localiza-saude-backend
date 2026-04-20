import { z } from "zod";
import { ratingSchema } from "./create-rating";

export const getRatingsByProviderParamsSchema = z.object({
	healthcareProviderId: z.cuid(),
});

export const getRatingsByProviderResponseSchema = z.object({
	ratings: z.array(ratingSchema),
	stats: z.object({
		averageRating: z.number(),
		totalRatings: z.number().int(),
	}),
});

export type GetRatingsByProviderParamsSchema = z.infer<
	typeof getRatingsByProviderParamsSchema
>;
export type GetRatingsByProviderResponseSchema = z.infer<
	typeof getRatingsByProviderResponseSchema
>;

export const getRatingsByProviderRouteOptions = {
	schema: {
		tags: ["Ratings"],
		summary: "Get all ratings for a healthcare provider",
		description:
			"Returns all ratings for a specific healthcare provider along with statistics (average rating and total count)",
		security: [{ bearerAuth: [] }],
		params: getRatingsByProviderParamsSchema,
		response: {
			200: getRatingsByProviderResponseSchema,
		},
	},
};
