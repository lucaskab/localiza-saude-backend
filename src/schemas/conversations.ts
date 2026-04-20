import { z } from "zod";

export const sendTextMessageSchema = z.object({
	conversationId: z.string().cuid().optional(),
	recipientId: z.string().cuid(),
	content: z.string().min(1).max(5000),
	relatedAppointmentId: z.string().cuid().optional(),
});

export const sendFileMessageSchema = z.object({
	conversationId: z.string().cuid().optional(),
	recipientId: z.string().cuid(),
	relatedAppointmentId: z.string().cuid().optional(),
});

export const getConversationMessagesSchema = z.object({
	conversationId: z.string().cuid(),
	limit: z.coerce.number().int().positive().max(100).default(50),
	offset: z.coerce.number().int().min(0).default(0),
	relatedAppointmentId: z.string().cuid().optional(),
});

export const getConversationsSchema = z.object({
	limit: z.coerce.number().int().positive().max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});

export const getOrCreateConversationSchema = z.object({
	participantId: z.string().cuid(),
});

export const deleteMessageSchema = z.object({
	messageId: z.string().cuid(),
});
