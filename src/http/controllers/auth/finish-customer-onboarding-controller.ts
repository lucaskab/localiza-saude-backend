import type { FastifyReply, FastifyRequest } from "fastify";
import { addressPresenter } from "@/http/presenters/address-presenter";
import { finishCustomerOnboardingUseCase } from "@/http/useCases/auth/finish-customer-onboarding-use-case";
import type { FinishCustomerOnboardingBodySchema } from "@/schemas/routes/auth/customer-onboarding";

export const finishCustomerOnboardingController = {
	async handle(
		request: FastifyRequest<{ Body: FinishCustomerOnboardingBodySchema }>,
		reply: FastifyReply,
	) {
		const userId = await request.getCurrentUserId();
		const result = await finishCustomerOnboardingUseCase.execute(
			userId,
			request.body,
		);

		return reply.status(200).send({
			user: result.user,
			customer: {
				...result.customer,
				primaryAddress: result.primaryAddress
					? addressPresenter.toHTTP(result.primaryAddress)
					: null,
			},
		});
	},
};
