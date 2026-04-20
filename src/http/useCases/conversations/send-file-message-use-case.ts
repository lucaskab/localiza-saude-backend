import { prisma } from "@/database/prisma";
import type {
	ConversationWithParticipants,
	MessageWithSender,
} from "@/http/repositories/conversations/conversation-repository-contract";
import { prismaConversationRepository } from "@/http/repositories/conversations/conversation-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { storageService } from "@/http/services/storage.service";
import type { MessageSenderType } from "../../../../prisma/generated/prisma/client";

interface SendFileMessageParams {
	senderId: string;
	senderType: MessageSenderType;
	recipientId: string;
	file: File;
	conversationId?: string;
	relatedAppointmentId?: string;
}

export const sendFileMessageUseCase = {
	async execute(params: SendFileMessageParams): Promise<{
		message: MessageWithSender;
		conversation: ConversationWithParticipants;
	}> {
		const {
			senderId,
			senderType,
			recipientId,
			file,
			conversationId,
			relatedAppointmentId,
		} = params;

		if (!file) {
			throw new BadRequestError("File is required");
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

		// Upload file to R2
		const uploadResult = await storageService.uploadFile({
			file,
			folder: "messages",
		});

		// Create file message
		const message = await prismaConversationRepository.createMessage({
			conversationId: finalConversationId,
			senderId,
			senderType,
			messageType: "FILE",
			fileUrl: uploadResult.url,
			fileName: uploadResult.fileName,
			fileSize: uploadResult.fileSize,
			fileMimeType: uploadResult.mimeType,
			relatedAppointmentId,
		});

		// Get updated conversation
		const conversation =
			await prismaConversationRepository.getById(finalConversationId);

		if (!conversation) {
			throw new BadRequestError("Conversation not found");
		}

		return { message, conversation };
	},
};
