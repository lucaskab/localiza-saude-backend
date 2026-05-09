import { z } from "zod";
import { clinicWithEmployeesSchema } from "./get-clinics";

export const getMyClinicsResponseSchema = z.object({
	clinics: z.array(clinicWithEmployeesSchema),
});

export type GetMyClinicsResponseSchema = z.infer<
	typeof getMyClinicsResponseSchema
>;

export const getMyClinicsRouteOptions = {
	schema: {
		tags: ["Clinics"],
		summary: "Get clinics the current user belongs to",
		security: [{ bearerAuth: [] }],
		response: {
			200: getMyClinicsResponseSchema,
		},
	},
};
