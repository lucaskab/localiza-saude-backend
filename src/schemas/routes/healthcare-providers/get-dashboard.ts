import { z } from "zod";

export const getDashboardParamsSchema = z.object({
	healthcareProviderId: z.cuid(),
});

const appointmentTrendSchema = z.object({
	date: z.string(),
	count: z.number().int(),
});

const popularProcedureSchema = z.object({
	procedureId: z.string(),
	procedureName: z.string(),
	count: z.number().int(),
	revenue: z.number().int(),
});

const recentRatingSchema = z.object({
	id: z.cuid(),
	rating: z.number().int(),
	comment: z.string().nullable(),
	customerName: z.string(),
	createdAt: z.date(),
});

export const getDashboardResponseSchema = z.object({
	todayAppointments: z.object({
		total: z.number().int(),
		scheduled: z.number().int(),
		completed: z.number().int(),
		cancelled: z.number().int(),
	}),
	monthlyRevenue: z.object({
		currentMonth: z.number().int(),
		lastMonth: z.number().int(),
		growthPercentage: z.number(),
	}),
	ratings: z.object({
		averageRating: z.number(),
		totalRatings: z.number().int(),
		recentRatings: z.array(recentRatingSchema),
	}),
	appointments: z.object({
		upcomingCount: z.number().int(),
		thisMonthTotal: z.number().int(),
		lastMonthTotal: z.number().int(),
		growthPercentage: z.number(),
		weekTrend: z.array(appointmentTrendSchema),
	}),
	patients: z.object({
		totalUnique: z.number().int(),
		newThisMonth: z.number().int(),
	}),
	popularProcedures: z.array(popularProcedureSchema).max(5),
	cancellationRate: z.object({
		thisMonth: z.number(),
		lastMonth: z.number(),
	}),
});

export type GetDashboardParamsSchema = z.infer<typeof getDashboardParamsSchema>;
export type GetDashboardResponseSchema = z.infer<
	typeof getDashboardResponseSchema
>;

export const getDashboardRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Get dashboard metrics for a healthcare provider",
		description:
			"Returns comprehensive dashboard data including today's appointments, revenue metrics, ratings, patient statistics, popular procedures, and trends.",
		security: [{ bearerAuth: [] }],
		params: getDashboardParamsSchema,
		response: {
			200: getDashboardResponseSchema,
		},
	},
};
