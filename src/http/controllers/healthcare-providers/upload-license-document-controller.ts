import type { FastifyReply, FastifyRequest } from "fastify";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { uploadLicenseDocumentUseCase } from "@/http/useCases/healthcare-providers/upload-license-document-use-case";
import type { LicenseDocumentParamsSchema } from "@/schemas/routes/healthcare-providers/license-document";

export const uploadLicenseDocumentController = {
	async handle(
		request: FastifyRequest<{ Params: LicenseDocumentParamsSchema }>,
		reply: FastifyReply,
	) {
		const currentUser = await request.getCurrentUser();
		const file = await request.file({
			limits: {
				fileSize: 5 * 1024 * 1024,
				files: 1,
				fields: 0,
			},
		});

		if (!file) {
			throw new BadRequestError("Document file is required");
		}

		const buffer = await file.toBuffer();
		const result = await uploadLicenseDocumentUseCase.execute({
			healthcareProviderId: request.params.id,
			currentUser,
			buffer,
			fileName: file.filename,
			mimeType: file.mimetype,
		});

		return reply.status(201).send(result);
	},
};
