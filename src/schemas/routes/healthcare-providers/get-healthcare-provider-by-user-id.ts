import { z } from "zod";
import { procedureSchema } from "../procedures/get-procedures";
import { healthcareProviderProfileSchema } from "../users/user";

const healthcareProviderProfileWithRelationsSchema =
	healthcareProviderProfileSchema.extend({
		procedures: z.array(procedureSchema),
	});

export const getHealthcareProviderByUserIdParamsSchema = z.object({
	userId: z.string(),
});

export const getHealthcareProviderByUserIdResponseSchema = z.object({
	healthcareProvider: healthcareProviderProfileWithRelationsSchema,
});

export type GetHealthcareProviderByUserIdParamsSchema = z.infer<
	typeof getHealthcareProviderByUserIdParamsSchema
>;
export type GetHealthcareProviderByUserIdResponseSchema = z.infer<
	typeof getHealthcareProviderByUserIdResponseSchema
>;

export const getHealthcareProviderByUserIdRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Get healthcare provider by user ID",
		security: [{ bearerAuth: [] }],
		params: getHealthcareProviderByUserIdParamsSchema,
		response: {
			200: getHealthcareProviderByUserIdResponseSchema,
		},
	},
};
