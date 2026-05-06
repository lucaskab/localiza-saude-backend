import { prismaConversationRepository } from "@/http/repositories/conversations/conversation-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { storageService } from "@/http/services/storage.service";

interface GetMessageFileUrlParams {
	messageId: string;
	currentUserId: string;
}

export const getMessageFileUrlUseCase = {
	async execute(params: GetMessageFileUrlParams) {
		const message = await prismaConversationRepository.findMessageById(
			params.messageId,
		);

		if (!message || message.messageType !== "FILE" || !message.fileKey) {
			throw new BadRequestError("File message not found");
		}

		const conversation = await prismaConversationRepository.getById(
			message.conversationId,
		);

		if (!conversation) {
			throw new BadRequestError("Conversation not found");
		}

		const canAccessFile =
			conversation.customer.user.id === params.currentUserId ||
			conversation.healthcareProvider.user.id === params.currentUserId;

		if (!canAccessFile) {
			throw new UnauthorizedError();
		}

		return {
			url: storageService.presignUrl(message.fileKey, 60),
			fileName: message.fileName,
			fileMimeType: message.fileMimeType,
			expiresIn: 60,
		};
	},
};
