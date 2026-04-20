import { z } from "zod";

export const customerSchema = z.object({
	id: z.cuid(),
	userId: z.string(),
	cpf: z.string().nullable(),
	dateOfBirth: z.date().nullable(),
	address: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const getCustomersResponseSchema = z.object({
	customers: z.array(customerSchema),
});

export type GetCustomersResponseSchema = z.infer<
	typeof getCustomersResponseSchema
>;

export const getCustomersRouteOptions = {
	schema: {
		tags: ["Customers"],
		summary: "Get all customers",
		security: [{ bearerAuth: [] }],
		response: {
			200: getCustomersResponseSchema,
		},
	},
};
