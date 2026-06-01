import { z } from "zod";

export const customerHomeSummarySchema = z.object({
	totalAppointments: z.number().int().nonnegative(),
	upcomingAppointments: z.number().int().nonnegative(),
	favoritesCount: z.number().int().nonnegative(),
});

export const getCustomerHomeSummaryResponseSchema = z.object({
	summary: customerHomeSummarySchema,
});

export type GetCustomerHomeSummaryResponseSchema = z.infer<
	typeof getCustomerHomeSummaryResponseSchema
>;

export const getCustomerHomeSummaryRouteOptions = {
	schema: {
		tags: ["Customers"],
		summary: "Get customer home summary",
		description:
			"Returns appointment and favorites counts for the authenticated customer's home screen.",
		security: [{ bearerAuth: [] }],
		response: {
			200: getCustomerHomeSummaryResponseSchema,
		},
	},
};
