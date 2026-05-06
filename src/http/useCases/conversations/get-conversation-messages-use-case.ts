import type {
	ConversationWithParticipants,
	MessageWithSender,
} from "@/http/repositories/conversations/conversation-repository-contract";
import { prismaConversationRepository } from "@/http/repositories/conversations/conversation-repository-implementation";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";

interface GetConversationMessagesParams {
	conversationId: string;
	currentUserId: string;
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
		const {
			conversationId,
			currentUserId,
			limit,
			offset,
			relatedAppointmentId,
		} = params;

		// Get conversation data
		const conversation =
			await prismaConversationRepository.getById(conversationId);

		if (!conversation) {
			throw new Error("Conversation not found");
		}

		const canAccessConversation =
			conversation.customer.user.id === currentUserId ||
			conversation.healthcareProvider.user.id === currentUserId;

		if (!canAccessConversation) {
			throw new UnauthorizedError();
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
