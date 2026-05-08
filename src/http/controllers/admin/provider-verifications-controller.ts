import type { FastifyReply, FastifyRequest } from "fastify";
import { providerVerificationsUseCase } from "@/http/useCases/admin/provider-verifications-use-case";
import type {
	ApproveProviderVerificationBodySchema,
	GetAdminProviderVerificationsQuerySchema,
	ProviderVerificationParamsSchema,
	RejectProviderVerificationBodySchema,
} from "@/schemas/routes/admin/provider-verifications";

export const providerVerificationsController = {
	async list(
		request: FastifyRequest<{
			Querystring: GetAdminProviderVerificationsQuerySchema;
		}>,
		reply: FastifyReply,
	) {
		const currentUser = await request.getCurrentUser();
		const result = await providerVerificationsUseCase.list(
			currentUser,
			request.query,
		);

		return reply.status(200).send(result);
	},

	async get(
		request: FastifyRequest<{ Params: ProviderVerificationParamsSchema }>,
		reply: FastifyReply,
	) {
		const currentUser = await request.getCurrentUser();
		const result = await providerVerificationsUseCase.get(
			currentUser,
			request.params.id,
		);

		return reply.status(200).send(result);
	},

	async approve(
		request: FastifyRequest<{
			Params: ProviderVerificationParamsSchema;
			Body: ApproveProviderVerificationBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const currentUser = await request.getCurrentUser();
		const result = await providerVerificationsUseCase.approve(
			currentUser,
			request.params.id,
			request.body,
		);

		return reply.status(200).send(result);
	},

	async reject(
		request: FastifyRequest<{
			Params: ProviderVerificationParamsSchema;
			Body: RejectProviderVerificationBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const currentUser = await request.getCurrentUser();
		const result = await providerVerificationsUseCase.reject(
			currentUser,
			request.params.id,
			request.body,
		);

		return reply.status(200).send(result);
	},

	async getDocument(
		request: FastifyRequest<{ Params: ProviderVerificationParamsSchema }>,
		reply: FastifyReply,
	) {
		const currentUser = await request.getCurrentUser();
		const result = await providerVerificationsUseCase.getDocument({
			currentUser,
			healthcareProviderId: request.params.id,
			ipAddress: request.ip,
			userAgent: request.headers["user-agent"] ?? null,
		});

		return reply.status(200).send(result);
	},
};
