import { z } from "zod";
import { healthcareProviderSchema } from "@/schemas/routes/healthcare-providers/get-healthcare-providers";

export const getFavoritesResponseSchema = z.object({
	favorites: z.array(healthcareProviderSchema),
});

export type GetFavoritesResponseSchema = z.infer<
	typeof getFavoritesResponseSchema
>;

export const getFavoritesRouteOptions = {
	schema: {
		tags: ["Favorites"],
		summary: "Get favorite healthcare providers",
		description:
			"Returns the authenticated customer's favorite healthcare providers.",
		security: [{ bearerAuth: [] }],
		response: {
			200: getFavoritesResponseSchema,
		},
	},
};
