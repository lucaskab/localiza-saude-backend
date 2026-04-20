import { prisma } from "@/database/prisma";
import type { ConversationWithParticipants } from "@/http/repositories/conversations/conversation-repository-contract";
import { prismaConversationRepository } from "@/http/repositories/conversations/conversation-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

interface GetOrCreateConversationParams {
	userId: string;
	userType: "CUSTOMER" | "HEALTHCARE_PROVIDER";
	participantId: string;
}

export const getOrCreateConversationUseCase = {
	async execute(
		params: GetOrCreateConversationParams,
	): Promise<{ conversation: ConversationWithParticipants }> {
		const { userId, userType, participantId } = params;

		let customerId: string;
		let healthcareProviderId: string;

		// If user is a CUSTOMER, they need a customer profile and participant needs a provider profile
		if (userType === "CUSTOMER") {
			const customerProfile = await prisma.customer.findUnique({
				where: { userId },
			});

			if (!customerProfile) {
				throw new BadRequestError("Customer profile not found");
			}

			const providerProfile = await prisma.healthcare_provider.findUnique({
				where: { userId: participantId },
			});

			if (!providerProfile) {
				throw new BadRequestError("Healthcare provider not found");
			}

			customerId = customerProfile.id;
			healthcareProviderId = providerProfile.id;
		} else {
			// User is a HEALTHCARE_PROVIDER
			const providerProfile = await prisma.healthcare_provider.findUnique({
				where: { userId },
			});

			if (!providerProfile) {
				throw new BadRequestError("Healthcare provider profile not found");
			}

			const customerProfile = await prisma.customer.findUnique({
				where: { userId: participantId },
			});

			if (!customerProfile) {
				throw new BadRequestError("Customer not found");
			}

			customerId = customerProfile.id;
			healthcareProviderId = providerProfile.id;
		}

		const baseConversation =
			await prismaConversationRepository.getOrCreateConversation({
				customerId,
				healthcareProviderId,
			});

		// Fetch the conversation with full participant details
		const conversation = await prisma.conversation.findUnique({
			where: {
				id: baseConversation.id,
			},
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
					},
				},
			},
		});

		return { conversation: conversation as ConversationWithParticipants };
	},
};
