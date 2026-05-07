import { prisma } from "@/database/prisma";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { CompleteOnboardingBodySchema } from "@/schemas/routes/auth/complete-onboarding";

export const completeOnboardingUseCase = {
	async execute(userId: string, data: CompleteOnboardingBodySchema) {
		const existingUser = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (!existingUser) {
			throw new BadRequestError("User not found");
		}

		if (existingUser.onboardingCompleted) {
			throw new BadRequestError("Onboarding already completed");
		}

		return prisma.$transaction(async (tx) => {
			const user = await tx.user.update({
				where: {
					id: userId,
				},
				data: {
					role: data.role,
					onboardingCompleted: true,
					...(data.role === "HEALTHCARE_PROVIDER" && {
						displayName: existingUser.name,
						verificationStatus: "PENDING",
					}),
				},
				include: {
					procedures: {
						orderBy: {
							createdAt: "desc",
						},
					},
					faqs: {
						orderBy: {
							position: "asc",
						},
					},
				},
			});

			return { user };
		});
	},
};
