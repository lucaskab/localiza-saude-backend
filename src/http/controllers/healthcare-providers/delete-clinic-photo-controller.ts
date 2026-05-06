import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteClinicPhotoUseCase } from "@/http/useCases/healthcare-providers/delete-clinic-photo-use-case";
import type {
	ClinicPhotoParamsSchema,
	DeleteClinicPhotoBodySchema,
} from "@/schemas/routes/healthcare-providers/clinic-photo";

export const deleteClinicPhotoController = {
	async handle(
		request: FastifyRequest<{
			Params: ClinicPhotoParamsSchema;
			Body: DeleteClinicPhotoBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const currentUser = await request.getCurrentUser();
		const result = await deleteClinicPhotoUseCase.execute({
			healthcareProviderId: request.params.id,
			currentUser,
			index: request.body.index,
		});

		return reply.status(200).send(result);
	},
};
