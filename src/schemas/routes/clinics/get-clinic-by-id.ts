import { z } from "zod";
import { clinicSchema } from "./get-clinics";

export const getClinicByIdParamsSchema = z.object({
	id: z.cuid(),
});

export const getClinicByIdResponseSchema = z.object({
	clinic: clinicSchema,
});

export type GetClinicByIdParamsSchema = z.infer<
	typeof getClinicByIdParamsSchema
>;
export type GetClinicByIdResponseSchema = z.infer<
	typeof getClinicByIdResponseSchema
>;

export const getClinicByIdRouteOptions = {
	schema: {
		tags: ["Clinics"],
		summary: "Get clinic by ID",
		params: getClinicByIdParamsSchema,
		response: {
			200: getClinicByIdResponseSchema,
		},
	},
};
