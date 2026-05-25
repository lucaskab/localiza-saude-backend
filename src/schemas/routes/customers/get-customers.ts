import { z } from "zod";
import { addressSchema } from "../addresses/address";
import { customerUserSchema } from "../users/user";

export const customerSchema = customerUserSchema.extend({
	cpf: z.string().nullable(),
	dateOfBirth: z.date().nullable(),
	primaryAddress: addressSchema.nullable().optional(),
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
		summary: "Get all patients",
		security: [{ bearerAuth: [] }],
		response: {
			200: getCustomersResponseSchema,
		},
	},
};
