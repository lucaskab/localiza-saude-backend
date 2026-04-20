import { z } from "zod";

export const getConversationsQuerySchema = z.object({
	limit: z.coerce.number().int().positive().max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});

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

export const conversationWithParticipantsSchema = z.object({
	id: z.string(),
	customerId: z.string(),
	healthcareProviderId: z.string(),
	lastMessageAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	customer: conversationParticipantSchema,
	healthcareProvider: conversationParticipantSchema,
	lastMessage: z
		.object({
			id: z.string(),
			messageType: z.enum(["TEXT", "FILE"]),
			content: z.string().nullable(),
			fileUrl: z.string().nullable(),
			fileName: z.string().nullable(),
			createdAt: z.date(),
		})
		.nullable(),
});

export const getConversationsResponseSchema = z.object({
	conversations: z.array(conversationWithParticipantsSchema),
});

export type GetConversationsQuerySchema = z.infer<
	typeof getConversationsQuerySchema
>;
export type GetConversationsResponseSchema = z.infer<
	typeof getConversationsResponseSchema
>;

export const getConversationsRouteOptions = {
	schema: {
		tags: ["Conversations"],
		summary: "Get user conversations",
		security: [{ bearerAuth: [] }],
		querystring: getConversationsQuerySchema,
		response: {
			200: getConversationsResponseSchema,
		},
	},
};
