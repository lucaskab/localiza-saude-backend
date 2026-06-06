import { z } from "zod";
import { sendFileMessageSchema } from "@/schemas/conversations";

export const sendFileMessageBodySchema = sendFileMessageSchema;

export const messageSenderSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	image: z.string().nullable(),
});

export const userSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	image: z.string().nullable(),
});

export const conversationSchema = z.object({
	id: z.cuid(),
	customerId: z.cuid(),
	healthcareProviderId: z.cuid(),
	lastMessageAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	customer: userSchema,
	healthcareProvider: userSchema,
	lastMessage: z
		.object({
			id: z.cuid(),
			messageType: z.enum(["TEXT", "FILE"]),
			content: z.string().nullable(),
			fileUrl: z.string().nullable(),
			fileName: z.string().nullable(),
			createdAt: z.date(),
		})
		.nullable(),
});

export const messageRelatedAppointmentSchema = z.object({
	id: z.cuid(),
	scheduledAt: z.date(),
	status: z.string(),
});

export const messageSchema = z.object({
	id: z.cuid(),
	conversationId: z.cuid(),
	senderId: z.cuid(),
	senderType: z.enum(["CUSTOMER", "HEALTHCARE_PROVIDER"]),
	messageType: z.enum(["TEXT", "FILE"]),
	content: z.string().nullable(),
	fileUrl: z.string().nullable(),
	fileName: z.string().nullable(),
	fileSize: z.number().nullable(),
	fileMimeType: z.string().nullable(),
	relatedAppointmentId: z.cuid().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	sender: messageSenderSchema,
	relatedAppointment: messageRelatedAppointmentSchema.nullable(),
});

export const sendFileMessageResponseSchema = z.object({
	message: messageSchema,
	conversation: conversationSchema,
});

export type SendFileMessageBodySchema = z.infer<
	typeof sendFileMessageBodySchema
>;
export type SendFileMessageResponseSchema = z.infer<
	typeof sendFileMessageResponseSchema
>;

export const sendFileMessageRouteOptions = {
	schema: {
		tags: ["Conversations"],
		summary: "Send a file message",
		security: [{ bearerAuth: [] }],
		// Note: No body schema validation for multipart/form-data
		// Validation is handled manually in the controller
		response: {
			201: sendFileMessageResponseSchema,
		},
	},
};
