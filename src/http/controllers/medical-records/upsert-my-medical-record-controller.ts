import type { FastifyReply, FastifyRequest } from "fastify";
import { upsertMyMedicalRecordUseCase } from "@/http/useCases/medical-records/upsert-medical-record-use-case";
import type { UpsertMyMedicalRecordBodySchema } from "@/schemas/routes/medical-records/upsert-my-medical-record";

export const upsertMyMedicalRecordController = {
	async handle(
		request: FastifyRequest<{ Body: UpsertMyMedicalRecordBodySchema }>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const result = await upsertMyMedicalRecordUseCase.execute(
			user.id,
			request.body,
		);

		return reply.status(200).send(result);
	},
};
