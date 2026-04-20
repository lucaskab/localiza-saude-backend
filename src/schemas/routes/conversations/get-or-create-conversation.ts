import { z } from "zod";
import { getOrCreateConversationSchema } from "@/schemas/conversations";

export const getOrCreateConversationBodySchema = getOrCreateConversationSchema;

export const conversationParticipantUserSchema = z.object({
	id: z.string(),
	name: z.string(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	image: z.string().nullable(),
});

export const conversationParticipantSchema = z.object({
	id: z.string(),
	user: conversationParticipantUserSchema,
});

export const conversationSchema = z.object({
	id: z.string(),
	customerId: z.string(),
	healthcareProviderId: z.string(),
	lastMessageAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	customer: conversationParticipantSchema,
	healthcareProvider: conversationParticipantSchema,
});

export const getOrCreateConversationResponseSchema = z.object({
	conversation: conversationSchema,
});

export type GetOrCreateConversationBodySchema = z.infer<
	typeof getOrCreateConversationBodySchema
>;
export type GetOrCreateConversationResponseSchema = z.infer<
	typeof getOrCreateConversationResponseSchema
>;

export const getOrCreateConversationRouteOptions = {
	schema: {
		tags: ["Conversations"],
		summary: "Get or create a conversation with a participant",
		security: [{ bearerAuth: [] }],
		body: getOrCreateConversationBodySchema,
		response: {
			200: getOrCreateConversationResponseSchema,
		},
	},
};
