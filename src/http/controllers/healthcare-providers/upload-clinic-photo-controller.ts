import type { FastifyReply, FastifyRequest } from "fastify";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { uploadClinicPhotoUseCase } from "@/http/useCases/healthcare-providers/upload-clinic-photo-use-case";
import type { ClinicPhotoParamsSchema } from "@/schemas/routes/healthcare-providers/clinic-photo";

export const uploadClinicPhotoController = {
	async handle(
		request: FastifyRequest<{ Params: ClinicPhotoParamsSchema }>,
		reply: FastifyReply,
	) {
		const currentUser = await request.getCurrentUser();
		const file = await request.file({
			limits: {
				fileSize: 4 * 1024 * 1024,
				files: 1,
				fields: 0,
			},
		});

		if (!file) {
			throw new BadRequestError("Clinic photo file is required");
		}

		const result = await uploadClinicPhotoUseCase.execute({
			healthcareProviderId: request.params.id,
			currentUser,
			buffer: await file.toBuffer(),
			mimeType: file.mimetype,
		});

		return reply.status(201).send(result);
	},
};
