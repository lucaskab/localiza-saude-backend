import { z } from "zod";
import { addressInputSchema } from "../addresses/address";
import { clinicSchema, clinicTypeSchema } from "./get-clinics";

export const createClinicBodySchema = z.object({
	name: z.string().min(1),
	phone: z.string().min(1),
	description: z.string().nullable().optional(),
	email: z.email(),
	type: clinicTypeSchema,
	address: addressInputSchema.optional(),
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
