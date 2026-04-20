import { z } from "zod";

export const deleteProcedureParamsSchema = z.object({
	id: z.cuid(),
});

export const deleteProcedureResponseSchema = z.object({
	message: z.string(),
});

export type DeleteProcedureParamsSchema = z.infer<
	typeof deleteProcedureParamsSchema
>;
export type DeleteProcedureResponseSchema = z.infer<
	typeof deleteProcedureResponseSchema
>;

export const deleteProcedureRouteOptions = {
	schema: {
		tags: ["Procedures"],
		summary: "Delete a procedure",
		security: [{ bearerAuth: [] }],
		params: deleteProcedureParamsSchema,
		response: {
			200: deleteProcedureResponseSchema,
		},
	},
};
