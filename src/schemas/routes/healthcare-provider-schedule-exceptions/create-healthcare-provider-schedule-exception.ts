import { z } from "zod";
import {
	healthcareProviderScheduleExceptionSchema,
	scheduleExceptionTypeSchema,
	timeRegex,
} from "./get-schedule-exceptions-by-healthcare-provider";

export const createHealthcareProviderScheduleExceptionBodySchema = z.object({
	healthcareProviderId: z.cuid(),
	date: z.coerce.date(),
	type: scheduleExceptionTypeSchema,
	startTime: z.string().regex(timeRegex).nullable().optional(),
	endTime: z.string().regex(timeRegex).nullable().optional(),
	reason: z.string().trim().max(240).nullable().optional(),
});

export const createHealthcareProviderScheduleExceptionResponseSchema = z.object({
	exception: healthcareProviderScheduleExceptionSchema,
});

export type CreateHealthcareProviderScheduleExceptionBodySchema = z.infer<
	typeof createHealthcareProviderScheduleExceptionBodySchema
>;
export type CreateHealthcareProviderScheduleExceptionResponseSchema = z.infer<
	typeof createHealthcareProviderScheduleExceptionResponseSchema
>;

export const createHealthcareProviderScheduleExceptionRouteOptions = {
	schema: {
		tags: ["Healthcare Provider Schedule Exceptions"],
		summary: "Create a healthcare provider schedule exception",
		security: [{ bearerAuth: [] }],
		body: createHealthcareProviderScheduleExceptionBodySchema,
		response: {
			201: createHealthcareProviderScheduleExceptionResponseSchema,
		},
	},
};
