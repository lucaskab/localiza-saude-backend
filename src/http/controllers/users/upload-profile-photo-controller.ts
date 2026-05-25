import type { FastifyReply, FastifyRequest } from "fastify";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { uploadProfilePhotoUseCase } from "@/http/useCases/users/upload-profile-photo-use-case";
import type { ProfilePhotoParamsSchema } from "@/schemas/routes/users/profile-photo";

export const uploadProfilePhotoController = {
	async handle(
		request: FastifyRequest<{ Params: ProfilePhotoParamsSchema }>,
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
			throw new BadRequestError("Profile photo file is required");
		}

		const result = await uploadProfilePhotoUseCase.execute({
			userId: request.params.id,
			currentUser,
			buffer: await file.toBuffer(),
			mimeType: file.mimetype,
		});

		return reply.status(201).send(result);
	},
};
