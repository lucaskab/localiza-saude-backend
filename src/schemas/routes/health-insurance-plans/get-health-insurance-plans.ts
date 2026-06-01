import { z } from "zod";
import { healthInsurancePlanSchema } from "./health-insurance-plan";

export const getHealthInsurancePlansResponseSchema = z.object({
	healthInsurancePlans: z.array(healthInsurancePlanSchema),
});

export type GetHealthInsurancePlansResponseSchema = z.infer<
	typeof getHealthInsurancePlansResponseSchema
>;

export const getHealthInsurancePlansRouteOptions = {
	schema: {
		tags: ["Health Insurance Plans"],
		summary: "List health insurance plans",
		description:
			"Returns all active health insurance plans sorted alphabetically by name.",
		response: {
			200: getHealthInsurancePlansResponseSchema,
		},
	},
};
