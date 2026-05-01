import { z } from "zod";

export const notificationTypeSchema = z.enum([
	"APPOINTMENT_REMINDER",
	"APPOINTMENT_STATUS_UPDATE",
	"NEW_APPOINTMENT_REQUEST",
]);

export const notificationPreferenceSchema = z.object({
	type: notificationTypeSchema,
	enabled: z.boolean(),
});

export const notificationPreferencesResponseSchema = z.object({
	preferences: z.array(notificationPreferenceSchema),
});

export type NotificationTypeSchema = z.infer<typeof notificationTypeSchema>;
export type NotificationPreferenceSchema = z.infer<
	typeof notificationPreferenceSchema
>;
