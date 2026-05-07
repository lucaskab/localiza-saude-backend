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

		if (userType === "CUSTOMER") {
			const customer = await prisma.user.findUnique({
				where: { id: userId, role: "CUSTOMER" },
			});

			if (!customer) {
				throw new BadRequestError("Customer user not found");
			}

			const healthcareProvider = await prisma.user.findUnique({
				where: { id: participantId, role: "HEALTHCARE_PROVIDER" },
			});

			if (!healthcareProvider) {
				throw new BadRequestError("HealthcareProvider user not found");
			}

			customerId = customer.id;
			healthcareProviderId = healthcareProvider.id;
		} else {
			const healthcareProvider = await prisma.user.findUnique({
				where: { id: userId, role: "HEALTHCARE_PROVIDER" },
			});

			if (!healthcareProvider) {
				throw new BadRequestError("HealthcareProvider user not found");
			}

			const customer = await prisma.user.findUnique({
				where: { id: participantId, role: "CUSTOMER" },
			});

			if (!customer) {
				throw new BadRequestError("Customer user not found");
			}

			customerId = customer.id;
			healthcareProviderId = healthcareProvider.id;
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
						name: true,
						firstName: true,
						lastName: true,
						image: true,
					},
				},
				healthcareProvider: {
					select: {
						id: true,
						name: true,
						firstName: true,
						lastName: true,
						image: true,
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
						fileKey: true,
						fileName: true,
						createdAt: true,
					},
				},
			},
		});

		return { conversation: conversation as ConversationWithParticipants };
	},
};
