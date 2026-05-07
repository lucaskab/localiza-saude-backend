import { prisma } from "@/database/prisma";
import type {
	ConversationWithParticipants,
	MessageWithSender,
} from "@/http/repositories/conversations/conversation-repository-contract";
import { prismaConversationRepository } from "@/http/repositories/conversations/conversation-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { MessageSenderType } from "../../../../prisma/generated/prisma/client";

interface SendTextMessageParams {
	senderId: string;
	senderType: MessageSenderType;
	recipientId: string;
	content: string;
	conversationId?: string;
	relatedAppointmentId?: string;
}

export const sendTextMessageUseCase = {
	async execute(
		params: SendTextMessageParams,
	): Promise<{
		message: MessageWithSender;
		conversation: ConversationWithParticipants;
	}> {
		const {
			senderId,
			senderType,
			recipientId,
			content,
			conversationId,
			relatedAppointmentId,
		} = params;

		if (!content || content.trim().length === 0) {
			throw new BadRequestError("Content cannot be empty");
		}

		// Determine customerId and healthcareProviderId based on senderType
		let customerId: string;
		let healthcareProviderId: string;

		if (senderType === "CUSTOMER") {
			const customer = await prisma.user.findUnique({
				where: { id: senderId, role: "CUSTOMER" },
			});

			if (!customer) {
				throw new BadRequestError("Customer user not found");
			}

			const healthcareProvider = await prisma.user.findUnique({
				where: { id: recipientId, role: "HEALTHCARE_PROVIDER" },
			});

			if (!healthcareProvider) {
				throw new BadRequestError("HealthcareProvider user not found");
			}

			customerId = customer.id;
			healthcareProviderId = recipientId;
		} else {
			const healthcareProvider = await prisma.user.findUnique({
				where: { id: senderId, role: "HEALTHCARE_PROVIDER" },
			});

			if (!healthcareProvider) {
				throw new BadRequestError("HealthcareProvider user not found");
			}

			const customer = await prisma.user.findUnique({
				where: { id: recipientId, role: "CUSTOMER" },
			});

			if (!customer) {
				throw new BadRequestError("Customer user not found");
			}

			customerId = recipientId;
			healthcareProviderId = healthcareProvider.id;
		}

		// Get or create conversation if conversationId is not provided
		let finalConversationId: string;
		if (!conversationId) {
			const conversation =
				await prismaConversationRepository.getOrCreateConversation({
					customerId,
					healthcareProviderId,
				});
			finalConversationId = conversation.id;
		} else {
			finalConversationId = conversationId;

			const conversation =
				await prismaConversationRepository.getById(finalConversationId);

			if (!conversation) {
				throw new BadRequestError("Conversation not found");
			}

			if (
				conversation.customerId !== customerId ||
				conversation.healthcareProviderId !== healthcareProviderId
			) {
				throw new BadRequestError("Conversation does not match participants");
			}
		}

		// Create text message
		const message = await prismaConversationRepository.createMessage({
			conversationId: finalConversationId,
			senderId,
			senderType,
			messageType: "TEXT",
			content,
			relatedAppointmentId,
		});

		// Get updated conversation
		const conversation =
			await prismaConversationRepository.getById(finalConversationId);

		if (!conversation) {
			throw new BadRequestError(
				"Conversation not found after creating message",
			);
		}

		return { message, conversation };
	},
};
