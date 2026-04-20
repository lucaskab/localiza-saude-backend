import type {
	conversation,
	conversation_message,
	MessageSenderType,
	MessageType,
} from "../../../../prisma/generated/prisma/client";

export interface CreateConversationParams {
	customerId: string;
	healthcareProviderId: string;
}

export interface FindConversationParams {
	customerId: string;
	healthcareProviderId: string;
}

export interface GetOrCreateConversationParams {
	customerId: string;
	healthcareProviderId: string;
}

export interface CreateMessageParams {
	conversationId: string;
	senderId: string;
	senderType: MessageSenderType;
	messageType: MessageType;
	content?: string;
	relatedAppointmentId?: string;
	fileUrl?: string;
	fileName?: string;
	fileSize?: number;
	fileMimeType?: string;
}

export interface GetMessagesParams {
	conversationId: string;
	limit: number;
	offset: number;
	relatedAppointmentId?: string;
}

export interface GetConversationsParams {
	userId: string;
	userType: "CUSTOMER" | "HEALTHCARE_PROVIDER";
	limit: number;
	offset: number;
}

export interface ConversationWithParticipants extends conversation {
	customer: {
		id: string;
		user: {
			id: string;
			name: string;
			firstName: string | null;
			lastName: string | null;
			image: string | null;
		};
	};
	healthcareProvider: {
		id: string;
		user: {
			id: string;
			name: string;
			firstName: string | null;
			lastName: string | null;
			image: string | null;
		};
	};
	messages: conversation_message[];
}

export interface MessageWithSender extends conversation_message {
	sender: {
		id: string;
		name: string;
		firstName: string | null;
		lastName: string | null;
		image: string | null;
	};
	relatedAppointment?: {
		id: string;
		scheduledAt: Date;
		status: string;
	} | null;
}

export interface ConversationRepository {
	findConversation(
		params: FindConversationParams,
	): Promise<conversation | null>;
	createConversation(params: CreateConversationParams): Promise<conversation>;
	getOrCreateConversation(
		params: GetOrCreateConversationParams,
	): Promise<conversation>;
	getById(conversationId: string): Promise<ConversationWithParticipants | null>;
	createMessage(params: CreateMessageParams): Promise<MessageWithSender>;
	getMessages(params: GetMessagesParams): Promise<MessageWithSender[]>;
	getConversations(
		params: GetConversationsParams,
	): Promise<ConversationWithParticipants[]>;
	deleteMessage(messageId: string): Promise<void>;
	findMessageById(messageId: string): Promise<conversation_message | null>;
	updateConversationLastMessage(conversationId: string): Promise<void>;
}
