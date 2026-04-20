import type { ConversationWithParticipants } from "@/http/repositories/conversations/conversation-repository-contract";
import { prismaConversationRepository } from "@/http/repositories/conversations/conversation-repository-implementation";

interface GetConversationsParams {
	userId: string;
	userType: "CUSTOMER" | "HEALTHCARE_PROVIDER";
	limit: number;
	offset: number;
}

export const getConversationsUseCase = {
	async execute(
		params: GetConversationsParams,
	): Promise<{ conversations: ConversationWithParticipants[] }> {
		const { userId, userType, limit, offset } = params;

		const conversations = await prismaConversationRepository.getConversations({
			userId,
			userType,
			limit,
			offset,
		});

		return { conversations };
	},
};
