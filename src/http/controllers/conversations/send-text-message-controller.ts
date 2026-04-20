import type { FastifyReply, FastifyRequest } from "fastify";
import {
	conversationPresenter,
	messagePresenter,
} from "@/http/presenters/conversation-presenter";
import { sendTextMessageUseCase } from "@/http/useCases/conversations/send-text-message-use-case";
import type { SendTextMessageBodySchema } from "@/schemas/routes/conversations/send-text-message";

export const sendTextMessageController = {
	async handle(
		request: FastifyRequest<{ Body: SendTextMessageBodySchema }>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const { conversationId, recipientId, content, relatedAppointmentId } =
			request.body;

		// Map user role to senderType
		const senderType: "CUSTOMER" | "HEALTHCARE_PROVIDER" =
			user.role === "CUSTOMER" ? "CUSTOMER" : "HEALTHCARE_PROVIDER";

		const result = await sendTextMessageUseCase.execute({
			senderId: user.id,
			senderType,
			recipientId,
			content,
			conversationId,
			relatedAppointmentId,
		});

		return reply.status(201).send({
			message: messagePresenter.toHTTP(result.message),
			conversation: conversationPresenter.toHTTP(result.conversation),
		});
	},
};
