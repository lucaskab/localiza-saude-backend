import { z } from "zod";

export const favoriteSchema = z.object({
	customerId: z.cuid(),
	healthcareProviderId: z.cuid(),
});

export const addFavoriteBodySchema = z.object({
	healthcareProviderId: z.cuid(),
});

export const addFavoriteResponseSchema = z.object({
	favorite: favoriteSchema,
});

export type AddFavoriteBodySchema = z.infer<typeof addFavoriteBodySchema>;
export type AddFavoriteResponseSchema = z.infer<
	typeof addFavoriteResponseSchema
>;

export const addFavoriteRouteOptions = {
	schema: {
		tags: ["Favorites"],
		summary: "Add a favorite healthcare provider",
		description:
			"Adds a healthcare provider to the authenticated customer's favorites.",
		security: [{ bearerAuth: [] }],
		body: addFavoriteBodySchema,
		response: {
			201: addFavoriteResponseSchema,
		},
	},
};
