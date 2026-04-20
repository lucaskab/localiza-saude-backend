import { prismaConversationRepository } from "@/http/repositories/conversations/conversation-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { storageService } from "@/http/services/storage.service";

export const deleteMessageUseCase = {
	async execute(messageId: string): Promise<{ message: string }> {
		const existingMessage =
			await prismaConversationRepository.findMessageById(messageId);

		if (!existingMessage) {
			throw new BadRequestError("Message not found");
		}

		// If message has a file, delete it from R2
		if (existingMessage.fileUrl) {
			const fileKey = storageService.extractKeyFromUrl(existingMessage.fileUrl);
			if (fileKey) {
				await storageService.deleteFile(fileKey);
			}
		}

		await prismaConversationRepository.deleteMessage(messageId);

		return { message: "Message deleted successfully" };
	},
};
