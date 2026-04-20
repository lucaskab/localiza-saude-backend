type ConversationWithParticipants = {
	id: string;
	customerId: string;
	healthcareProviderId: string;
	lastMessageAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
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
	messages?: Array<{
		id: string;
		messageType: string;
		content: string | null;
		fileUrl: string | null;
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
	fileUrl: string | null;
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
				user: {
					id: conversation.customer.user.id,
					name: conversation.customer.user.name,
					firstName: conversation.customer.user.firstName,
					lastName: conversation.customer.user.lastName,
					image: conversation.customer.user.image,
				},
			},
			healthcareProvider: {
				id: conversation.healthcareProvider.id,
				user: {
					id: conversation.healthcareProvider.user.id,
					name: conversation.healthcareProvider.user.name,
					firstName: conversation.healthcareProvider.user.firstName,
					lastName: conversation.healthcareProvider.user.lastName,
					image: conversation.healthcareProvider.user.image,
				},
			},
			lastMessage:
				conversation.messages && conversation.messages[0]
					? {
							id: conversation.messages[0].id,
							messageType: conversation.messages[0].messageType,
							content: conversation.messages[0].content,
							fileUrl: conversation.messages[0].fileUrl,
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
			fileUrl: message.fileUrl,
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
				image: message.sender.image,
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
