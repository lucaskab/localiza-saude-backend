import { notificationPreferencesResponseSchema } from "./notifications";

export const getNotificationPreferencesRouteOptions = {
	schema: {
		tags: ["Notifications"],
		summary: "Get notification preferences for the authenticated user",
		security: [{ bearerAuth: [] }],
		response: {
			200: notificationPreferencesResponseSchema,
		},
	},
};
