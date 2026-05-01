import { z } from "zod";

export const unregisterPushTokenBodySchema = z.object({
	token: z.string().min(1),
});

export const unregisterPushTokenResponseSchema = z.object({
	success: z.boolean(),
});

export type UnregisterPushTokenBodySchema = z.infer<
	typeof unregisterPushTokenBodySchema
>;

export const unregisterPushTokenRouteOptions = {
	schema: {
		tags: ["Notifications"],
		summary: "Unregister an Expo push token for the authenticated user",
		security: [{ bearerAuth: [] }],
		body: unregisterPushTokenBodySchema,
		response: {
			200: unregisterPushTokenResponseSchema,
		},
	},
};
