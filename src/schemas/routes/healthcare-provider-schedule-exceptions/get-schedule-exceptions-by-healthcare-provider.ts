import { z } from "zod";
import { healthcareProviderUserSchema } from "../users/user";

export const scheduleExceptionTypeSchema = z.enum([
	"DAY_OFF",
	"TIME_BLOCK",
	"SPECIAL_HOURS",
	"EXTRA_SLOT",
]);

export const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

export const healthcareProviderScheduleExceptionSchema = z.object({
	id: z.cuid(),
	healthcareProviderId: z.cuid(),
	healthcareProvider: healthcareProviderUserSchema,
	date: z.date(),
	type: scheduleExceptionTypeSchema,
	startTime: z.string().nullable(),
	endTime: z.string().nullable(),
	reason: z.string().nullable(),
	isActive: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const getScheduleExceptionsByHealthcareProviderParamsSchema = z.object({
	healthcareProviderId: z.cuid(),
});

export const getScheduleExceptionsByHealthcareProviderQuerySchema = z.object({
	from: z.string().date().optional(),
	to: z.string().date().optional(),
});

export const getScheduleExceptionsByHealthcareProviderResponseSchema = z.object({
	exceptions: z.array(healthcareProviderScheduleExceptionSchema),
});

export type GetScheduleExceptionsByHealthcareProviderParamsSchema = z.infer<
	typeof getScheduleExceptionsByHealthcareProviderParamsSchema
>;
export type GetScheduleExceptionsByHealthcareProviderQuerySchema = z.infer<
	typeof getScheduleExceptionsByHealthcareProviderQuerySchema
>;
export type GetScheduleExceptionsByHealthcareProviderResponseSchema = z.infer<
	typeof getScheduleExceptionsByHealthcareProviderResponseSchema
>;

export const getScheduleExceptionsByHealthcareProviderRouteOptions = {
	schema: {
		tags: ["Healthcare Provider Schedule Exceptions"],
		summary: "Get schedule exceptions by healthcare provider",
		params: getScheduleExceptionsByHealthcareProviderParamsSchema,
		querystring: getScheduleExceptionsByHealthcareProviderQuerySchema,
		response: {
			200: getScheduleExceptionsByHealthcareProviderResponseSchema,
		},
	},
};
