import { z } from "zod";

export const getAppInfoResponseSchema = z.object({
	app: z.object({
		name: z.string(),
		apiVersion: z.string(),
		environment: z.string(),
		serverTime: z.date(),
	}),
});

export const getAppInfoRouteOptions = {
	schema: {
		tags: ["Settings"],
		summary: "Get app and API information",
		security: [{ bearerAuth: [] }],
		response: {
			200: getAppInfoResponseSchema,
		},
	},
};
