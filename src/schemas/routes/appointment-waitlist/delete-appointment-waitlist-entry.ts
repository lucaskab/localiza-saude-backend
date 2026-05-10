import { z } from "zod";

export const deleteAppointmentWaitlistEntryParamsSchema = z.object({
	id: z.cuid(),
});

export type DeleteAppointmentWaitlistEntryParamsSchema = z.infer<
	typeof deleteAppointmentWaitlistEntryParamsSchema
>;

export const deleteAppointmentWaitlistEntryRouteOptions = {
	schema: {
		tags: ["Appointment Waitlist"],
		summary: "Leave an appointment waitlist",
		security: [{ bearerAuth: [] }],
		params: deleteAppointmentWaitlistEntryParamsSchema,
		response: {
			204: z.null(),
		},
	},
};
