import { z } from "zod";
import { healthcareProviderSchema } from "./get-healthcare-providers";

export const clinicPhotoParamsSchema = z.object({
	id: z.cuid(),
});

export const deleteClinicPhotoBodySchema = z.object({
	index: z.number().int().min(0),
});

export const uploadClinicPhotoResponseSchema = z.object({
	healthcareProvider: healthcareProviderSchema,
	photo: z.object({
		url: z.url(),
		expiresInSeconds: z.number().int(),
	}),
});

export const deleteClinicPhotoResponseSchema = z.object({
	healthcareProvider: healthcareProviderSchema,
});

export type ClinicPhotoParamsSchema = z.infer<typeof clinicPhotoParamsSchema>;
export type DeleteClinicPhotoBodySchema = z.infer<
	typeof deleteClinicPhotoBodySchema
>;

export const uploadClinicPhotoRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Upload a clinic photo for the provider public profile",
		security: [{ bearerAuth: [] }],
		params: clinicPhotoParamsSchema,
		response: {
			201: uploadClinicPhotoResponseSchema,
		},
	},
};

export const deleteClinicPhotoRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Delete a clinic photo from the provider public profile",
		security: [{ bearerAuth: [] }],
		params: clinicPhotoParamsSchema,
		body: deleteClinicPhotoBodySchema,
		response: {
			200: deleteClinicPhotoResponseSchema,
		},
	},
};
