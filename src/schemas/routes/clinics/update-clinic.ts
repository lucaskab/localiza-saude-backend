import { z } from "zod";
import { clinicSchema, clinicTypeSchema } from "./get-clinics";

export const updateClinicParamsSchema = z.object({
	id: z.cuid(),
});

export const updateClinicBodySchema = z.object({
	name: z.string().min(1).optional(),
	phone: z.string().min(1).optional(),
	description: z.string().nullable().optional(),
	email: z.email().optional(),
	type: clinicTypeSchema.optional(),
	address: z.string().trim().nullable().optional(),
	latitude: z.number().min(-90).max(90).nullable().optional(),
	longitude: z.number().min(-180).max(180).nullable().optional(),
});

export const updateClinicResponseSchema = z.object({
	clinic: clinicSchema,
});

export type UpdateClinicParamsSchema = z.infer<typeof updateClinicParamsSchema>;
export type UpdateClinicBodySchema = z.infer<typeof updateClinicBodySchema>;
export type UpdateClinicResponseSchema = z.infer<
	typeof updateClinicResponseSchema
>;

export const updateClinicRouteOptions = {
	schema: {
		tags: ["Clinics"],
		summary: "Update a clinic",
		security: [{ bearerAuth: [] }],
		params: updateClinicParamsSchema,
		body: updateClinicBodySchema,
		response: {
			200: updateClinicResponseSchema,
		},
	},
};
