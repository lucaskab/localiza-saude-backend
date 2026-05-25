import { z } from "zod";
import { publicUserSchema } from "./user";

export const profilePhotoParamsSchema = z.object({
	id: z.cuid(),
});

export type ProfilePhotoParamsSchema = z.infer<typeof profilePhotoParamsSchema>;

export const uploadProfilePhotoResponseSchema = z.object({
	user: publicUserSchema,
	photo: z.object({
		url: z.url(),
		expiresInSeconds: z.number().int(),
	}),
});

export const uploadProfilePhotoRouteOptions = {
	schema: {
		tags: ["Users"],
		summary: "Upload a user's profile photo",
		security: [{ bearerAuth: [] }],
		params: profilePhotoParamsSchema,
		response: {
			201: uploadProfilePhotoResponseSchema,
		},
	},
};
