import type { FastifyReply, FastifyRequest } from "fastify";
import { completeOnboardingUseCase } from "@/http/useCases/auth/complete-onboarding-use-case";
import type { CompleteOnboardingBodySchema } from "@/schemas/routes/auth/complete-onboarding";

export const completeOnboardingController = {
	async handle(
		request: FastifyRequest<{ Body: CompleteOnboardingBodySchema }>,
		reply: FastifyReply,
	) {
		const userId = await request.getCurrentUserId();
		const result = await completeOnboardingUseCase.execute(userId, request.body);

		return reply.status(200).send(result);
	},
};
