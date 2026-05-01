import { z } from "zod";

export const sendDueAppointmentRemindersResponseSchema = z.object({
	processed: z.number().int(),
	sent: z.number().int(),
	skipped: z.number().int(),
	failed: z.number().int(),
});

export const sendDueAppointmentRemindersRouteOptions = {
	schema: {
		tags: ["Notifications"],
		summary: "Send due appointment reminder notifications",
		description:
			"Scans appointments in the next 24 hours and sends reminder notifications that have not been sent yet.",
		security: [{ bearerAuth: [] }],
		response: {
			200: sendDueAppointmentRemindersResponseSchema,
		},
	},
};
