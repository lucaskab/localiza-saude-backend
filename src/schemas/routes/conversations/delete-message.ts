import { z } from "zod";

export const deleteMessageParamsSchema = z.object({
	messageId: z.string().cuid(),
});

export const deleteMessageResponseSchema = z.object({
	message: z.string(),
});

export type DeleteMessageParamsSchema = z.infer<
	typeof deleteMessageParamsSchema
>;
export type DeleteMessageResponseSchema = z.infer<
	typeof deleteMessageResponseSchema
>;

export const deleteMessageRouteOptions = {
	schema: {
		tags: ["Conversations"],
		summary: "Delete a message",
		security: [{ bearerAuth: [] }],
		params: deleteMessageParamsSchema,
		response: {
			200: deleteMessageResponseSchema,
		},
	},
};
