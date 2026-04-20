import type {
	ConversationWithParticipants,
	MessageWithSender,
} from "@/http/repositories/conversations/conversation-repository-contract";
import { prismaConversationRepository } from "@/http/repositories/conversations/conversation-repository-implementation";

interface GetConversationMessagesParams {
	conversationId: string;
	limit: number;
	offset: number;
	relatedAppointmentId?: string;
}

export const getConversationMessagesUseCase = {
	async execute(
		params: GetConversationMessagesParams,
	): Promise<{
		messages: MessageWithSender[];
		conversation: ConversationWithParticipants;
	}> {
		const { conversationId, limit, offset, relatedAppointmentId } = params;

		// Get conversation data
		const conversation =
			await prismaConversationRepository.getById(conversationId);

		if (!conversation) {
			throw new Error("Conversation not found");
		}

		const messages = await prismaConversationRepository.getMessages({
			conversationId,
			limit,
			offset,
			relatedAppointmentId,
		});

		return { messages, conversation };
	},
};
