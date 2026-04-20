import { z } from "zod";

export const getTimeSlotsParamsSchema = z.object({
	healthcareProviderId: z.cuid(),
});

export const getTimeSlotsQuerySchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	procedureIds: z.string().min(1), // Comma-separated procedure IDs
});

const timeSlotSchema = z.object({
	startTime: z.string(),
	endTime: z.string(),
	available: z.boolean(),
});

export const getTimeSlotsResponseSchema = z.object({
	date: z.string(),
	healthcareProviderId: z.string(),
	totalDurationMinutes: z.number().int(),
	slotIntervalMinutes: z.number().int(),
	workingHours: z.object({
		startTime: z.string(),
		endTime: z.string(),
	}),
	slots: z.array(timeSlotSchema),
});

export type GetTimeSlotsParamsSchema = z.infer<typeof getTimeSlotsParamsSchema>;
export type GetTimeSlotsQuerySchema = z.infer<typeof getTimeSlotsQuerySchema>;
export type GetTimeSlotsResponseSchema = z.infer<
	typeof getTimeSlotsResponseSchema
>;

export const getTimeSlotsRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary:
			"Get all time slots for a day with availability status based on selected procedures",
		description:
			"Returns all possible time slots for a healthcare provider on a given day, marking each as available or unavailable based on the total duration of selected procedures and existing appointments. Slot interval is calculated based on the shortest procedure the provider offers.",
		security: [{ bearerAuth: [] }],
		params: getTimeSlotsParamsSchema,
		querystring: getTimeSlotsQuerySchema,
		response: {
			200: getTimeSlotsResponseSchema,
		},
	},
};
