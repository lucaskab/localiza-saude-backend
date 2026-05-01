import { z } from "zod";
import {
	notificationPreferenceSchema,
	notificationPreferencesResponseSchema,
} from "./notifications";

export const updateNotificationPreferencesBodySchema = z.object({
	preferences: z.array(notificationPreferenceSchema).min(1),
});

export type UpdateNotificationPreferencesBodySchema = z.infer<
	typeof updateNotificationPreferencesBodySchema
>;

export const updateNotificationPreferencesRouteOptions = {
	schema: {
		tags: ["Notifications"],
		summary: "Update notification preferences for the authenticated user",
		security: [{ bearerAuth: [] }],
		body: updateNotificationPreferencesBodySchema,
		response: {
			200: notificationPreferencesResponseSchema,
		},
	},
};
