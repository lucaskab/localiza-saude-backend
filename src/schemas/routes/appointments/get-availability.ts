import { z } from "zod";

export const getAvailabilityParamsSchema = z.object({
	healthcareProviderId: z.cuid(),
});

export const getAvailabilityQuerySchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	procedureIds: z.string().optional(),
});

export const timeSlotSchema = z.object({
	startTime: z.string(),
	endTime: z.string(),
	available: z.boolean(),
});

export const getAvailabilityResponseSchema = z.object({
	date: z.string(),
	totalDurationMinutes: z.number().int(),
	availableSlots: z.array(timeSlotSchema),
});

export type GetAvailabilityParamsSchema = z.infer<
	typeof getAvailabilityParamsSchema
>;
export type GetAvailabilityQuerySchema = z.infer<
	typeof getAvailabilityQuerySchema
>;
export type GetAvailabilityResponseSchema = z.infer<
	typeof getAvailabilityResponseSchema
>;

export const getAvailabilityRouteOptions = {
	schema: {
		tags: ["Appointments"],
		summary: "Get healthcare provider availability",
		security: [{ bearerAuth: [] }],
		params: getAvailabilityParamsSchema,
		querystring: getAvailabilityQuerySchema,
		response: {
			200: getAvailabilityResponseSchema,
		},
	},
};
