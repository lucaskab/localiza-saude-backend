import type { FastifyReply, FastifyRequest } from "fastify";
import { addressPresenter } from "@/http/presenters/address-presenter";
import { completeCustomerProfileUseCase } from "@/http/useCases/auth/complete-customer-profile-use-case";
import type { CompleteCustomerProfileBodySchema } from "@/schemas/routes/auth/customer-onboarding";

export const completeCustomerProfileController = {
	async handle(
		request: FastifyRequest<{ Body: CompleteCustomerProfileBodySchema }>,
		reply: FastifyReply,
	) {
		const userId = await request.getCurrentUserId();
		const result = await completeCustomerProfileUseCase.execute(
			userId,
			request.body,
		);

		return reply.status(200).send({
			user: result.user,
			customer: {
				...result.customer,
				primaryAddress: addressPresenter.toHTTP(result.primaryAddress),
			},
		});
	},
};
