import { prisma } from "@/database/prisma";
import type {
	ConversationRepository,
	ConversationWithParticipants,
	CreateConversationParams,
	CreateMessageParams,
	FindConversationParams,
	GetConversationsParams,
	GetMessagesParams,
	GetOrCreateConversationParams,
	MessageWithSender,
} from "./conversation-repository-contract";

export const prismaConversationRepository: ConversationRepository = {
	async findConversation(params: FindConversationParams) {
		const conversation = await prisma.conversation.findUnique({
			where: {
				customerId_healthcareProviderId: {
					customerId: params.customerId,
					healthcareProviderId: params.healthcareProviderId,
				},
			},
		});

		return conversation;
	},

	async createConversation(params: CreateConversationParams) {
		const conversation = await prisma.conversation.create({
			data: {
				customerId: params.customerId,
				healthcareProviderId: params.healthcareProviderId,
			},
		});

		return conversation;
	},

	async getOrCreateConversation(params: GetOrCreateConversationParams) {
		let conversation = await this.findConversation(params);

		if (!conversation) {
			conversation = await this.createConversation(params);
		}

		return conversation;
	},

	async getById(
		conversationId: string,
	): Promise<ConversationWithParticipants | null> {
		const conversation = await prisma.conversation.findUnique({
			where: {
				id: conversationId,
			},
			include: {
				customer: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								firstName: true,
								lastName: true,
								image: true,
							},
						},
					},
				},
				healthcareProvider: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								firstName: true,
								lastName: true,
								image: true,
							},
						},
					},
				},
				messages: {
					orderBy: {
						createdAt: "desc",
					},
					take: 1,
				},
			},
		});

		return conversation;
	},

	async createMessage(params: CreateMessageParams) {
		const message = await prisma.conversation_message.create({
			data: {
				conversationId: params.conversationId,
				senderId: params.senderId,
				senderType: params.senderType,
				messageType: params.messageType,
				content: params.content,
				relatedAppointmentId: params.relatedAppointmentId,
				fileUrl: params.fileUrl,
				fileName: params.fileName,
				fileSize: params.fileSize,
				fileMimeType: params.fileMimeType,
			},
			include: {
				sender: {
					select: {
						id: true,
						name: true,
						firstName: true,
						lastName: true,
						image: true,
					},
				},
				relatedAppointment: {
					select: {
						id: true,
						scheduledAt: true,
						status: true,
					},
				},
			},
		});

		// Update conversation's lastMessageAt
		await this.updateConversationLastMessage(params.conversationId);

		return message;
	},

	async getMessages(params: GetMessagesParams): Promise<MessageWithSender[]> {
		const where = {
			conversationId: params.conversationId,
			...(params.relatedAppointmentId && {
				relatedAppointmentId: params.relatedAppointmentId,
			}),
		};

		const messages = await prisma.conversation_message.findMany({
			where,
			orderBy: {
				createdAt: "desc",
			},
			take: params.limit,
			skip: params.offset,
			include: {
				sender: {
					select: {
						id: true,
						name: true,
						firstName: true,
						lastName: true,
						image: true,
					},
				},
				relatedAppointment: {
					select: {
						id: true,
						scheduledAt: true,
						status: true,
					},
				},
			},
		});

		return messages;
	},

	async getConversations(
		params: GetConversationsParams,
	): Promise<ConversationWithParticipants[]> {
		const where =
			params.userType === "CUSTOMER"
				? {
						customer: {
							userId: params.userId,
						},
					}
				: {
						healthcareProvider: {
							userId: params.userId,
						},
					};

		const conversations = await prisma.conversation.findMany({
			where,
			orderBy: {
				lastMessageAt: "desc",
			},
			take: params.limit,
			skip: params.offset,
			include: {
				customer: {
					select: {
						id: true,
						user: {
							select: {
								id: true,
								name: true,
								firstName: true,
								lastName: true,
								image: true,
							},
						},
					},
				},
				healthcareProvider: {
					select: {
						id: true,
						user: {
							select: {
								id: true,
								name: true,
								firstName: true,
								lastName: true,
								image: true,
							},
						},
					},
				},
				messages: {
					orderBy: {
						createdAt: "desc",
					},
					take: 1,
					select: {
						id: true,
						messageType: true,
						content: true,
						fileUrl: true,
						fileName: true,
						createdAt: true,
						senderId: true,
						senderType: true,
					},
				},
			},
		});

		return conversations as ConversationWithParticipants[];
	},

	async deleteMessage(messageId: string): Promise<void> {
		await prisma.conversation_message.delete({
			where: {
				id: messageId,
			},
		});
	},

	async findMessageById(messageId: string) {
		const message = await prisma.conversation_message.findUnique({
			where: {
				id: messageId,
			},
		});

		return message;
	},

	async updateConversationLastMessage(conversationId: string): Promise<void> {
		await prisma.conversation.update({
			where: {
				id: conversationId,
			},
			data: {
				lastMessageAt: new Date(),
			},
		});
	},
};
