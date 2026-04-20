import { z } from "zod";
import { customerSchema } from "./get-customers";

export const getCustomerByIdParamsSchema = z.object({
	id: z.cuid(),
});

export const getCustomerByIdResponseSchema = z.object({
	customer: customerSchema,
});

export type GetCustomerByIdParamsSchema = z.infer<
	typeof getCustomerByIdParamsSchema
>;
export type GetCustomerByIdResponseSchema = z.infer<
	typeof getCustomerByIdResponseSchema
>;

export const getCustomerByIdRouteOptions = {
	schema: {
		tags: ["Customers"],
		summary: "Get customer by ID",
		security: [{ bearerAuth: [] }],
		params: getCustomerByIdParamsSchema,
		response: {
			200: getCustomerByIdResponseSchema,
		},
	},
};
