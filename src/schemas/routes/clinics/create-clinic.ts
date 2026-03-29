import { z } from "zod";
import { clinicSchema, clinicTypeSchema } from "./get-clinics";

export const createClinicBodySchema = z.object({
	name: z.string().min(1),
	phone: z.string().min(1),
	description: z.string().nullable().optional(),
	email: z.email(),
	type: clinicTypeSchema,
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
	ownerId: z.cuid(),
});

export const createClinicResponseSchema = z.object({
	clinic: clinicSchema,
});

export type CreateClinicBodySchema = z.infer<typeof createClinicBodySchema>;
export type CreateClinicResponseSchema = z.infer<
	typeof createClinicResponseSchema
>;

export const createClinicRouteOptions = {
	schema: {
		tags: ["Clinics"],
		summary: "Create a new clinic",
		security: [{ bearerAuth: [] }],
		body: createClinicBodySchema,
		response: {
			201: createClinicResponseSchema,
		},
	},
};
