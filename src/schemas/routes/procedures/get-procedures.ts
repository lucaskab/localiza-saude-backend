import { z } from "zod";

export const procedureSchema = z.object({
	id: z.cuid(),
	name: z.string().min(1),
	description: z.string().nullable().optional(),
	priceInCents: z.number().int().min(0),
	durationInMinutes: z.number().int().min(1),
	healthcareProviderId: z.cuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
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
