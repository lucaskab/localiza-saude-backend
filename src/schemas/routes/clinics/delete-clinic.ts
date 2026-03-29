import { z } from "zod";

export const deleteClinicParamsSchema = z.object({
	id: z.cuid(),
});

export const deleteClinicResponseSchema = z.object({
	message: z.string(),
});

export type DeleteClinicParamsSchema = z.infer<typeof deleteClinicParamsSchema>;
export type DeleteClinicResponseSchema = z.infer<
	typeof deleteClinicResponseSchema
>;

export const deleteClinicRouteOptions = {
	schema: {
		tags: ["Clinics"],
		summary: "Delete a clinic",
		security: [{ bearerAuth: [] }],
		params: deleteClinicParamsSchema,
		response: {
			200: deleteClinicResponseSchema,
		},
	},
};
