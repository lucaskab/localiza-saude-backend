import { z } from "zod";
import { clinicSchema, clinicTypeSchema } from "./get-clinics";

export const createClinicBodySchema = z.object({
	name: z.string().min(1),
	phone: z.string().min(1),
	description: z.string().nullable().optional(),
	email: z.email(),
	type: clinicTypeSchema,
	address: z.string().trim().nullable().optional(),
	latitude: z.number().min(-90).max(90).nullable().optional(),
	longitude: z.number().min(-180).max(180).nullable().optional(),
	ownerId: z.cuid().optional(),
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
