import { z } from "zod";
import { customerSchema } from "./get-customers";

export const createCustomerBodySchema = z.object({
	userId: z.cuid(),
	cpf: z.string().nullable().optional(),
	dateOfBirth: z.coerce.date().nullable().optional(),
	address: z.string().nullable().optional(),
});

export const createCustomerResponseSchema = z.object({
	customer: customerSchema,
});

export type CreateCustomerBodySchema = z.infer<typeof createCustomerBodySchema>;
export type CreateCustomerResponseSchema = z.infer<
	typeof createCustomerResponseSchema
>;

export const createCustomerRouteOptions = {
	schema: {
		tags: ["Customers"],
		summary: "Create a new customer",
		security: [{ bearerAuth: [] }],
		body: createCustomerBodySchema,
		response: {
			201: createCustomerResponseSchema,
		},
	},
};
