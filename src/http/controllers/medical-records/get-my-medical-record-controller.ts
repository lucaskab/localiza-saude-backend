import type { FastifyReply, FastifyRequest } from "fastify";
import { getMyMedicalRecordUseCase } from "@/http/useCases/medical-records/get-medical-record-use-case";

export const getMyMedicalRecordController = {
	async handle(request: FastifyRequest, reply: FastifyReply) {
		const user = await request.getCurrentUser();
		const result = await getMyMedicalRecordUseCase.execute(user.id);

		return reply.status(200).send(result);
	},
};
