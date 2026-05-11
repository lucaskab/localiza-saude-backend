import { z } from "zod";
import { procedureSchema } from "./get-procedures";

const procedureChecklistItemBodySchema = z.object({
	text: z.string().trim().min(1),
	position: z.number().int().min(0).optional(),
});

export const createProcedureBodySchema = z.object({
	name: z.string().min(1),
	description: z.string().nullable().optional(),
	priceInCents: z.number().int().min(0),
	durationInMinutes: z.number().int().min(1),
	healthcareProviderId: z.cuid(),
	checklistItems: z.array(procedureChecklistItemBodySchema).max(30).optional(),
});

export const createProcedureResponseSchema = z.object({
	procedure: procedureSchema,
});

export type CreateProcedureBodySchema = z.infer<
	typeof createProcedureBodySchema
>;
export type CreateProcedureResponseSchema = z.infer<
	typeof createProcedureResponseSchema
>;

export const createProcedureRouteOptions = {
	schema: {
		tags: ["Procedures"],
		summary: "Create a new procedure",
		security: [{ bearerAuth: [] }],
		body: createProcedureBodySchema,
		response: {
			201: createProcedureResponseSchema,
		},
	},
};
