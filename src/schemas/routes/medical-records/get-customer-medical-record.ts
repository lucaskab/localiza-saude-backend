import { z } from "zod";
import { medicalRecordResponseSchema } from "./medical-record";

export const getCustomerMedicalRecordParamsSchema = z.object({
	customerId: z.cuid(),
});

export type GetCustomerMedicalRecordParamsSchema = z.infer<
	typeof getCustomerMedicalRecordParamsSchema
>;

export const getCustomerMedicalRecordRouteOptions = {
	schema: {
		tags: ["Medical Records"],
		summary: "Get a customer's medical record",
		description:
			"Customers can read their own medical record. Healthcare providers can read records only for customers who have confirmed appointments with them, and only when at least one medical record field is filled.",
		security: [{ bearerAuth: [] }],
		params: getCustomerMedicalRecordParamsSchema,
		response: {
			200: medicalRecordResponseSchema,
		},
	},
};
