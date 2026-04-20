import { z } from "zod";
import { procedureSchema } from "./get-procedures";

export const getProcedureByIdParamsSchema = z.object({
	id: z.cuid(),
});

export const getProcedureByIdResponseSchema = z.object({
	procedure: procedureSchema,
});

export type GetProcedureByIdParamsSchema = z.infer<
	typeof getProcedureByIdParamsSchema
>;
export type GetProcedureByIdResponseSchema = z.infer<
	typeof getProcedureByIdResponseSchema
>;

export const getProcedureByIdRouteOptions = {
	schema: {
		tags: ["Procedures"],
		summary: "Get procedure by ID",
		params: getProcedureByIdParamsSchema,
		response: {
			200: getProcedureByIdResponseSchema,
		},
	},
};
