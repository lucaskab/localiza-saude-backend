import type { FastifyReply, FastifyRequest } from "fastify";
import { getLicenseDocumentUrlUseCase } from "@/http/useCases/healthcare-providers/get-license-document-url-use-case";
import type { LicenseDocumentParamsSchema } from "@/schemas/routes/healthcare-providers/license-document";

export const getLicenseDocumentUrlController = {
	async handle(
		request: FastifyRequest<{ Params: LicenseDocumentParamsSchema }>,
		reply: FastifyReply,
	) {
		const currentUser = await request.getCurrentUser();
		const result = await getLicenseDocumentUrlUseCase.execute({
			healthcareProviderId: request.params.id,
			currentUser,
		});

		return reply.status(200).send(result);
	},
};
