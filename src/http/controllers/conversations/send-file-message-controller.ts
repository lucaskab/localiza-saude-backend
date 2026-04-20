import type { FastifyReply, FastifyRequest } from "fastify";
import {
	conversationPresenter,
	messagePresenter,
} from "@/http/presenters/conversation-presenter";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { sendFileMessageUseCase } from "@/http/useCases/conversations/send-file-message-use-case";
import type { SendFileMessageBodySchema } from "@/schemas/routes/conversations/send-file-message";

export const sendFileMessageController = {
	async handle(
		request: FastifyRequest<{ Body: SendFileMessageBodySchema }>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();

		// Get file from multipart form data
		const data = await request.file();

		if (!data) {
			throw new BadRequestError("File is required");
		}

		// Parse body fields
		const conversationId = data.fields.conversationId
			? String((data.fields.conversationId as any).value)
			: undefined;
		const recipientId = data.fields.recipientId
			? String((data.fields.recipientId as any).value)
			: undefined;
		const relatedAppointmentId = data.fields.relatedAppointmentId
			? String((data.fields.relatedAppointmentId as any).value)
			: undefined;

		if (!recipientId) {
			throw new BadRequestError("recipientId is required");
		}

		// Convert buffer to File
		const buffer = await data.toBuffer();
		const file = new File([buffer], data.filename, {
			type: data.mimetype,
		});

		// Map user role to senderType
		const senderType: "CUSTOMER" | "HEALTHCARE_PROVIDER" =
			user.role === "CUSTOMER" ? "CUSTOMER" : "HEALTHCARE_PROVIDER";

		const result = await sendFileMessageUseCase.execute({
			senderId: user.id,
			senderType,
			recipientId,
			file,
			conversationId,
			relatedAppointmentId,
		});

		return reply.status(201).send({
			message: messagePresenter.toHTTP(result.message),
			conversation: conversationPresenter.toHTTP(result.conversation),
		});
	},
};
