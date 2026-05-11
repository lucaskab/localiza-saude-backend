import { z } from "zod";
import { procedureSchema } from "./get-procedures";

const procedureChecklistItemBodySchema = z.object({
	text: z.string().trim().min(1),
	position: z.number().int().min(0).optional(),
});

export const updateProcedureParamsSchema = z.object({
	id: z.cuid(),
});

export const updateProcedureBodySchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().nullable().optional(),
	priceInCents: z.number().int().min(0).optional(),
	durationInMinutes: z.number().int().min(1).optional(),
	checklistItems: z.array(procedureChecklistItemBodySchema).max(30).optional(),
});

export const updateProcedureResponseSchema = z.object({
	procedure: procedureSchema,
});

export type UpdateProcedureParamsSchema = z.infer<
	typeof updateProcedureParamsSchema
>;
export type UpdateProcedureBodySchema = z.infer<
	typeof updateProcedureBodySchema
>;
export type UpdateProcedureResponseSchema = z.infer<
	typeof updateProcedureResponseSchema
>;

export const updateProcedureRouteOptions = {
	schema: {
		tags: ["Procedures"],
		summary: "Update a procedure",
		security: [{ bearerAuth: [] }],
		params: updateProcedureParamsSchema,
		body: updateProcedureBodySchema,
		response: {
			200: updateProcedureResponseSchema,
		},
	},
};
