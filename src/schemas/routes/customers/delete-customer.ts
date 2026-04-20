import { z } from "zod";

export const deleteCustomerParamsSchema = z.object({
	id: z.cuid(),
});

export const deleteCustomerResponseSchema = z.object({
	message: z.string(),
});

export type DeleteCustomerParamsSchema = z.infer<
	typeof deleteCustomerParamsSchema
>;
export type DeleteCustomerResponseSchema = z.infer<
	typeof deleteCustomerResponseSchema
>;

export const deleteCustomerRouteOptions = {
	schema: {
		tags: ["Customers"],
		summary: "Delete a customer",
		security: [{ bearerAuth: [] }],
		params: deleteCustomerParamsSchema,
		response: {
			200: deleteCustomerResponseSchema,
		},
	},
};
