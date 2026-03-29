import { z } from "zod";

export const clinicTypeSchema = z.enum([
	"MEDICAL",
	"HEALTH",
	"DENTAL",
	"EYE",
	"BEAUTY",
	"FREE",
]);

export const clinicSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	phone: z.string(),
	description: z.string().nullable(),
	email: z.email(),
	type: clinicTypeSchema,
	latitude: z.number(),
	longitude: z.number(),
	createdAt: z.date(),
	updatedAt: z.date(),
	ownerId: z.string(),
});

export const getClinicsResponseSchema = z.object({
	clinics: z.array(clinicSchema),
});

export type GetClinicsResponseSchema = z.infer<typeof getClinicsResponseSchema>;

export const getClinicsRouteOptions = {
	schema: {
		tags: ["Clinics"],
		summary: "Get all clinics",
		security: [{ bearerAuth: [] }],
		response: {
			200: getClinicsResponseSchema,
		},
	},
};
