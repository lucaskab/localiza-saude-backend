import { z } from "zod";
import { customerSchema } from "./get-customers";

export const updateCustomerParamsSchema = z.object({
	id: z.cuid(),
});

export const updateCustomerBodySchema = z.object({
	cpf: z.string().nullable().optional(),
	dateOfBirth: z.coerce.date().nullable().optional(),
	address: z.string().nullable().optional(),
});

export const updateCustomerResponseSchema = z.object({
	customer: customerSchema,
});

export type UpdateCustomerParamsSchema = z.infer<
	typeof updateCustomerParamsSchema
>;
export type UpdateCustomerBodySchema = z.infer<typeof updateCustomerBodySchema>;
export type UpdateCustomerResponseSchema = z.infer<
	typeof updateCustomerResponseSchema
>;

export const updateCustomerRouteOptions = {
	schema: {
		tags: ["Customers"],
		summary: "Update a customer",
		security: [{ bearerAuth: [] }],
		params: updateCustomerParamsSchema,
		body: updateCustomerBodySchema,
		response: {
			200: updateCustomerResponseSchema,
		},
	},
};
