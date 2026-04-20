import { z } from "zod";
import { customerSchema } from "./get-customers";

export const getCustomerByUserIdParamsSchema = z.object({
	userId: z.string(),
});

export const getCustomerByUserIdResponseSchema = z.object({
	customer: customerSchema,
});

export type GetCustomerByUserIdParamsSchema = z.infer<
	typeof getCustomerByUserIdParamsSchema
>;
export type GetCustomerByUserIdResponseSchema = z.infer<
	typeof getCustomerByUserIdResponseSchema
>;

export const getCustomerByUserIdRouteOptions = {
	schema: {
		tags: ["Customers"],
		summary: "Get customer by user ID",
		security: [{ bearerAuth: [] }],
		params: getCustomerByUserIdParamsSchema,
		response: {
			200: getCustomerByUserIdResponseSchema,
		},
	},
};
