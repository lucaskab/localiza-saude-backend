import { z } from "zod";
import { sendTextMessageSchema } from "@/schemas/conversations";

export const sendTextMessageBodySchema = sendTextMessageSchema;

export const messageSenderSchema = z.object({
	id: z.string(),
	name: z.string(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	image: z.string().nullable(),
});

export const messageRelatedAppointmentSchema = z.object({
	id: z.string(),
	scheduledAt: z.date(),
	status: z.string(),
});

export const messageSchema = z.object({
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
	sender: messageSenderSchema,
	relatedAppointment: messageRelatedAppointmentSchema.nullable(),
});

export const sendTextMessageResponseSchema = z.object({
	message: messageSchema,
});

export type SendTextMessageBodySchema = z.infer<
	typeof sendTextMessageBodySchema
>;
export type SendTextMessageResponseSchema = z.infer<
	typeof sendTextMessageResponseSchema
>;

export const sendTextMessageRouteOptions = {
	schema: {
		tags: ["Conversations"],
		summary: "Send a text message",
		security: [{ bearerAuth: [] }],
		body: sendTextMessageBodySchema,
		response: {
			201: sendTextMessageResponseSchema,
		},
	},
};
