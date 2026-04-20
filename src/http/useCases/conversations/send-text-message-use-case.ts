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
			// Sender is customer, recipient is provider
			const customerProfile = await prisma.customer.findUnique({
				where: { userId: senderId },
			});

			if (!customerProfile) {
				throw new BadRequestError("Customer profile not found");
			}

			// recipientId is already the healthcareProvider.id (CUID)
			const providerProfile = await prisma.healthcare_provider.findUnique({
				where: { id: recipientId },
			});

			if (!providerProfile) {
				throw new BadRequestError("Healthcare provider not found");
			}

			customerId = customerProfile.id;
			healthcareProviderId = recipientId;
		} else {
			// Sender is provider, recipient is customer
			const providerProfile = await prisma.healthcare_provider.findUnique({
				where: { userId: senderId },
			});

			if (!providerProfile) {
				throw new BadRequestError("Healthcare provider profile not found");
			}

			// recipientId is already the customer.id (CUID)
			const customerProfile = await prisma.customer.findUnique({
				where: { id: recipientId },
			});

			if (!customerProfile) {
				throw new BadRequestError("Customer not found");
			}

			customerId = recipientId;
			healthcareProviderId = providerProfile.id;
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
