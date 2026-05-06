import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteLicenseDocumentUseCase } from "@/http/useCases/healthcare-providers/delete-license-document-use-case";
import type { LicenseDocumentParamsSchema } from "@/schemas/routes/healthcare-providers/license-document";

export const deleteLicenseDocumentController = {
	async handle(
		request: FastifyRequest<{ Params: LicenseDocumentParamsSchema }>,
		reply: FastifyReply,
	) {
		const currentUser = await request.getCurrentUser();
		const result = await deleteLicenseDocumentUseCase.execute({
			healthcareProviderId: request.params.id,
			currentUser,
		});

		return reply.status(200).send(result);
	},
};
