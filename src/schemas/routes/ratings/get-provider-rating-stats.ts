import { z } from "zod";

export const getProviderRatingStatsParamsSchema = z.object({
	healthcareProviderId: z.cuid(),
});

export const getProviderRatingStatsResponseSchema = z.object({
	healthcareProviderId: z.string(),
	averageRating: z.number(),
	totalRatings: z.number().int(),
});

export type GetProviderRatingStatsParamsSchema = z.infer<
	typeof getProviderRatingStatsParamsSchema
>;
export type GetProviderRatingStatsResponseSchema = z.infer<
	typeof getProviderRatingStatsResponseSchema
>;

export const getProviderRatingStatsRouteOptions = {
	schema: {
		tags: ["Ratings"],
		summary: "Get rating statistics for a healthcare provider",
		description:
			"Returns the average rating (1-10) and total number of ratings for a healthcare provider.",
		security: [{ bearerAuth: [] }],
		params: getProviderRatingStatsParamsSchema,
		response: {
			200: getProviderRatingStatsResponseSchema,
		},
	},
};
