import { signUserImageUrl } from "@/http/useCases/users/sign-user-image-url";

type ConversationWithParticipants = {
	id: string;
	customerId: string;
	healthcareProviderId: string;
	lastMessageAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	customer: {
		id: string;
		name: string;
		firstName: string | null;
		lastName: string | null;
		image: string | null;
	};
	healthcareProvider: {
		id: string;
		name: string;
		firstName: string | null;
		lastName: string | null;
		image: string | null;
	};
	messages?: Array<{
		id: string;
		messageType: string;
		content: string | null;
		fileKey: string | null;
		fileName: string | null;
		createdAt: Date;
	}>;
};

type MessageWithSender = {
	id: string;
	conversationId: string;
	senderId: string;
	senderType: string;
	messageType: string;
	content: string | null;
	fileKey: string | null;
	fileName: string | null;
	fileSize: number | null;
	fileMimeType: string | null;
	relatedAppointmentId: string | null;
	createdAt: Date;
	updatedAt: Date;
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
};

export const conversationPresenter = {
	toHTTP(conversation: ConversationWithParticipants) {
		return {
			id: conversation.id,
			customerId: conversation.customerId,
			healthcareProviderId: conversation.healthcareProviderId,
			lastMessageAt: conversation.lastMessageAt,
			createdAt: conversation.createdAt,
			updatedAt: conversation.updatedAt,
			customer: {
				id: conversation.customer.id,
				name: conversation.customer.name,
				firstName: conversation.customer.firstName,
				lastName: conversation.customer.lastName,
				image: signUserImageUrl(conversation.customer.image),
			},
			healthcareProvider: {
				id: conversation.healthcareProvider.id,
				name: conversation.healthcareProvider.name,
				firstName: conversation.healthcareProvider.firstName,
				lastName: conversation.healthcareProvider.lastName,
				image: signUserImageUrl(conversation.healthcareProvider.image),
			},
			lastMessage:
				conversation.messages && conversation.messages[0]
					? {
							id: conversation.messages[0].id,
							messageType: conversation.messages[0].messageType,
							content: conversation.messages[0].content,
							fileUrl: null,
							fileName: conversation.messages[0].fileName,
							createdAt: conversation.messages[0].createdAt,
						}
					: null,
		};
	},

	toHTTPMany(conversations: ConversationWithParticipants[]) {
		return conversations.map((conversation) => this.toHTTP(conversation));
	},
};

export const messagePresenter = {
	toHTTP(message: MessageWithSender) {
		return {
			id: message.id,
			conversationId: message.conversationId,
			senderId: message.senderId,
			senderType: message.senderType,
			messageType: message.messageType,
			content: message.content,
			fileUrl: null,
			fileName: message.fileName,
			fileSize: message.fileSize,
			fileMimeType: message.fileMimeType,
			relatedAppointmentId: message.relatedAppointmentId,
			createdAt: message.createdAt,
			updatedAt: message.updatedAt,
			sender: {
				id: message.sender.id,
				name: message.sender.name,
				firstName: message.sender.firstName,
				lastName: message.sender.lastName,
				image: signUserImageUrl(message.sender.image),
			},
			relatedAppointment: message.relatedAppointment
				? {
						id: message.relatedAppointment.id,
						scheduledAt: message.relatedAppointment.scheduledAt,
						status: message.relatedAppointment.status,
					}
				: null,
		};
	},

	toHTTPMany(messages: MessageWithSender[]) {
		return messages.map((message) => this.toHTTP(message));
	},
};
