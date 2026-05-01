import { z } from "zod";

export const pushPlatformSchema = z.enum(["IOS", "ANDROID", "WEB", "UNKNOWN"]);

export const registerPushTokenBodySchema = z.object({
	token: z.string().min(1),
	platform: pushPlatformSchema.default("UNKNOWN"),
	deviceId: z.string().nullable().optional(),
});

export const registerPushTokenResponseSchema = z.object({
	pushToken: z.object({
		id: z.cuid(),
		token: z.string(),
		platform: pushPlatformSchema,
		isActive: z.boolean(),
	}),
});

export type RegisterPushTokenBodySchema = z.infer<
	typeof registerPushTokenBodySchema
>;

export const registerPushTokenRouteOptions = {
	schema: {
		tags: ["Notifications"],
		summary: "Register an Expo push token for the authenticated user",
		security: [{ bearerAuth: [] }],
		body: registerPushTokenBodySchema,
		response: {
			200: registerPushTokenResponseSchema,
		},
	},
};
