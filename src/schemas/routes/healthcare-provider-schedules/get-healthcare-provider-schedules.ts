import { z } from "zod";

const userSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	email: z.string().email(),
	phone: z.string().nullable(),
	image: z.string().nullable(),
	role: z.string(),
});

const healthcareProviderSchema = z.object({
	id: z.cuid(),
	userId: z.cuid(),
	specialty: z.string().nullable(),
	professionalId: z.string().nullable(),
	bio: z.string().nullable(),
	user: userSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const healthcareProviderScheduleSchema = z.object({
	id: z.cuid(),
	healthcareProviderId: z.cuid(),
	healthcareProvider: healthcareProviderSchema,
	dayOfWeek: z.number().int().min(0).max(6),
	startTime: z.string(),
	endTime: z.string(),
	isActive: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const getHealthcareProviderSchedulesResponseSchema = z.object({
	schedules: z.array(healthcareProviderScheduleSchema),
});

export type GetHealthcareProviderSchedulesResponseSchema = z.infer<
	typeof getHealthcareProviderSchedulesResponseSchema
>;

export const getHealthcareProviderSchedulesRouteOptions = {
	schema: {
		tags: ["Healthcare Provider Schedules"],
		summary: "Get all healthcare provider schedules",
		response: {
			200: getHealthcareProviderSchedulesResponseSchema,
		},
	},
};
