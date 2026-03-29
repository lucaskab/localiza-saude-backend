import { z } from "zod";
import { clinicSchema } from "./get-clinics";

export const getNearbyClinicsQuerySchema = z.object({
	latitude: z.coerce.number().min(-90).max(90),
	longitude: z.coerce.number().min(-180).max(180),
	radiusInKm: z.coerce.number().positive().default(10),
});

export const getNearbyClinicsResponseSchema = z.object({
	clinics: z.array(clinicSchema),
});

export type GetNearbyClinicsQuerySchema = z.infer<
	typeof getNearbyClinicsQuerySchema
>;
export type GetNearbyClinicsResponseSchema = z.infer<
	typeof getNearbyClinicsResponseSchema
>;

export const getNearbyClinicsRouteOptions = {
	schema: {
		tags: ["Clinics"],
		summary: "Get nearby clinics",
		querystring: getNearbyClinicsQuerySchema,
		response: {
			200: getNearbyClinicsResponseSchema,
		},
	},
};
