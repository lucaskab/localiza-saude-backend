import type { FastifyReply, FastifyRequest } from "fastify";
import { getPatientProfilesUseCase } from "@/http/useCases/patient-profiles/get-patient-profiles-use-case";

export const getPatientProfilesController = {
	async handle(request: FastifyRequest, reply: FastifyReply) {
		const user = await request.getCurrentUser();
		const result = await getPatientProfilesUseCase.execute(user);

		return reply.status(200).send(result);
	},
};
