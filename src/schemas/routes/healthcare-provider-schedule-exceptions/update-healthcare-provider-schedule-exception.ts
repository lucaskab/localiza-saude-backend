import { z } from "zod";
import {
	healthcareProviderScheduleExceptionSchema,
	scheduleExceptionTypeSchema,
	timeRegex,
} from "./get-schedule-exceptions-by-healthcare-provider";

export const updateHealthcareProviderScheduleExceptionParamsSchema = z.object({
	id: z.string().trim().min(1),
});

export const updateHealthcareProviderScheduleExceptionBodySchema = z.object({
	date: z.coerce.date().optional(),
	type: scheduleExceptionTypeSchema.optional(),
	startTime: z.string().regex(timeRegex).nullable().optional(),
	endTime: z.string().regex(timeRegex).nullable().optional(),
	reason: z.string().trim().max(240).nullable().optional(),
	isActive: z.boolean().optional(),
});

export const updateHealthcareProviderScheduleExceptionResponseSchema = z.object({
	exception: healthcareProviderScheduleExceptionSchema,
});

export type UpdateHealthcareProviderScheduleExceptionParamsSchema = z.infer<
	typeof updateHealthcareProviderScheduleExceptionParamsSchema
>;
export type UpdateHealthcareProviderScheduleExceptionBodySchema = z.infer<
	typeof updateHealthcareProviderScheduleExceptionBodySchema
>;
export type UpdateHealthcareProviderScheduleExceptionResponseSchema = z.infer<
	typeof updateHealthcareProviderScheduleExceptionResponseSchema
>;

export const updateHealthcareProviderScheduleExceptionRouteOptions = {
	schema: {
		tags: ["Healthcare Provider Schedule Exceptions"],
		summary: "Update a healthcare provider schedule exception",
		security: [{ bearerAuth: [] }],
		params: updateHealthcareProviderScheduleExceptionParamsSchema,
		body: updateHealthcareProviderScheduleExceptionBodySchema,
		response: {
			200: updateHealthcareProviderScheduleExceptionResponseSchema,
		},
	},
};
