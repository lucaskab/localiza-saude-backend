import { z } from "zod";

export const getMessageFileUrlParamsSchema = z.object({
	messageId: z.cuid(),
});

export const getMessageFileUrlResponseSchema = z.object({
	url: z.string().url(),
	fileName: z.string().nullable(),
	fileMimeType: z.string().nullable(),
	expiresIn: z.number(),
});

export type GetMessageFileUrlParamsSchema = z.infer<
	typeof getMessageFileUrlParamsSchema
>;

export type GetMessageFileUrlResponseSchema = z.infer<
	typeof getMessageFileUrlResponseSchema
>;

export const getMessageFileUrlRouteOptions = {
	schema: {
		tags: ["Conversations"],
		summary: "Get a temporary URL for a message file",
		security: [{ bearerAuth: [] }],
		params: getMessageFileUrlParamsSchema,
		response: {
			200: getMessageFileUrlResponseSchema,
		},
	},
};
