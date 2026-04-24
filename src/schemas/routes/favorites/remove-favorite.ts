import { z } from "zod";

export const removeFavoriteParamsSchema = z.object({
	healthcareProviderId: z.cuid(),
});

export const removeFavoriteResponseSchema = z.object({
	message: z.string(),
});

export type RemoveFavoriteParamsSchema = z.infer<
	typeof removeFavoriteParamsSchema
>;
export type RemoveFavoriteResponseSchema = z.infer<
	typeof removeFavoriteResponseSchema
>;

export const removeFavoriteRouteOptions = {
	schema: {
		tags: ["Favorites"],
		summary: "Remove a favorite healthcare provider",
		description:
			"Removes a healthcare provider from the authenticated customer's favorites.",
		security: [{ bearerAuth: [] }],
		params: removeFavoriteParamsSchema,
		response: {
			200: removeFavoriteResponseSchema,
		},
	},
};
