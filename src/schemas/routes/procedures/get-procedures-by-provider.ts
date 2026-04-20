import { z } from "zod";
import { procedureSchema } from "./get-procedures";

export const getProceduresByProviderParamsSchema = z.object({
	healthcareProviderId: z.cuid(),
});

export const getProceduresByProviderResponseSchema = z.object({
	procedures: z.array(procedureSchema),
});

export type GetProceduresByProviderParamsSchema = z.infer<
	typeof getProceduresByProviderParamsSchema
>;
export type GetProceduresByProviderResponseSchema = z.infer<
	typeof getProceduresByProviderResponseSchema
>;

export const getProceduresByProviderRouteOptions = {
	schema: {
		tags: ["Procedures"],
		summary: "Get procedures by healthcare provider",
		params: getProceduresByProviderParamsSchema,
		response: {
			200: getProceduresByProviderResponseSchema,
		},
	},
};
