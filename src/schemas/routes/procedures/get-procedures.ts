import { z } from "zod";

const entityIdSchema = z.cuid();

export const procedureChecklistItemSchema = z.object({
	id: entityIdSchema,
	procedureId: entityIdSchema,
	text: z.string().min(1),
	position: z.number().int(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const procedureSchema = z.object({
	id: entityIdSchema,
	name: z.string().min(1),
	description: z.string().nullable().optional(),
	priceInCents: z.number().int().min(0),
	durationInMinutes: z.number().int().min(1),
	healthcareProviderId: entityIdSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
	checklistItems: z.array(procedureChecklistItemSchema).default([]),
});

export const getProceduresResponseSchema = z.object({
	procedures: z.array(procedureSchema),
});

export type GetProceduresResponseSchema = z.infer<
	typeof getProceduresResponseSchema
>;

export const getProceduresRouteOptions = {
	schema: {
		tags: ["Procedures"],
		summary: "Get all procedures",
		security: [{ bearerAuth: [] }],
		response: {
			200: getProceduresResponseSchema,
		},
	},
};
