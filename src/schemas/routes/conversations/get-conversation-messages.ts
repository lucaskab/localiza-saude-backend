import { z } from "zod";

const userSchema = z.object({
	id: z.string(),
	name: z.string(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	image: z.string().nullable(),
});

const conversationSchema = z.object({
	id: z.string(),
	customerId: z.string(),
	healthcareProviderId: z.string(),
	lastMessageAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	customer: z.object({
		id: z.string(),
		user: userSchema,
	}),
	healthcareProvider: z.object({
		id: z.string(),
		user: userSchema,
	}),
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

export const getConversationMessagesParamsSchema = z.object({
	conversationId: z.string().cuid(),
});

export const getConversationMessagesQuerySchema = z.object({
	limit: z.coerce.number().int().positive().max(100).default(50),
	offset: z.coerce.number().int().min(0).default(0),
	relatedAppointmentId: z.string().cuid().optional(),
});

export const messageWithSenderSchema = z.object({
	id: z.string(),
	conversationId: z.string(),
	senderId: z.string(),
	senderType: z.enum(["CUSTOMER", "HEALTHCARE_PROVIDER"]),
	messageType: z.enum(["TEXT", "FILE"]),
	content: z.string().nullable(),
	fileUrl: z.string().nullable(),
	fileName: z.string().nullable(),
	fileSize: z.number().nullable(),
	fileMimeType: z.string().nullable(),
	relatedAppointmentId: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	sender: z.object({
		id: z.string(),
		name: z.string(),
		firstName: z.string().nullable(),
		lastName: z.string().nullable(),
		image: z.string().nullable(),
	}),
	relatedAppointment: z
		.object({
			id: z.string(),
			scheduledAt: z.date(),
			status: z.string(),
		})
		.nullable(),
});

export const getConversationMessagesResponseSchema = z.object({
	messages: z.array(messageWithSenderSchema),
	conversation: conversationSchema,
});

export type GetConversationMessagesParamsSchema = z.infer<
	typeof getConversationMessagesParamsSchema
>;
export type GetConversationMessagesQuerySchema = z.infer<
	typeof getConversationMessagesQuerySchema
>;
export type GetConversationMessagesResponseSchema = z.infer<
	typeof getConversationMessagesResponseSchema
>;

export const getConversationMessagesRouteOptions = {
	schema: {
		tags: ["Conversations"],
		summary: "Get messages from a conversation",
		security: [{ bearerAuth: [] }],
		params: getConversationMessagesParamsSchema,
		querystring: getConversationMessagesQuerySchema,
		response: {
			200: getConversationMessagesResponseSchema,
		},
	},
};
