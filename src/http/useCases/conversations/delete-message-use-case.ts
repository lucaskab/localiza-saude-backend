import { prismaConversationRepository } from "@/http/repositories/conversations/conversation-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { storageService } from "@/http/services/storage.service";

export const deleteMessageUseCase = {
	async execute(params: {
		messageId: string;
		currentUserId: string;
	}): Promise<{ message: string }> {
		const existingMessage =
			await prismaConversationRepository.findMessageById(params.messageId);

		if (!existingMessage) {
			throw new BadRequestError("Message not found");
		}

		if (existingMessage.senderId !== params.currentUserId) {
			throw new UnauthorizedError();
		}

		// If message has a file, delete it from R2
		if (existingMessage.fileKey) {
			await storageService.deleteFile(
				storageService.normalizeStoredKey(existingMessage.fileKey),
			);
		}

		await prismaConversationRepository.deleteMessage(params.messageId);

		return { message: "Message deleted successfully" };
	},
};
