import type { FastifyReply, FastifyRequest } from "fastify";
import { createPatientProfileUseCase } from "@/http/useCases/patient-profiles/create-patient-profile-use-case";
import type { CreatePatientProfileBodySchema } from "@/schemas/routes/patient-profiles/create-patient-profile";

export const createPatientProfileController = {
	async handle(
		request: FastifyRequest<{ Body: CreatePatientProfileBodySchema }>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const result = await createPatientProfileUseCase.execute(
			user,
			request.body,
		);

		return reply.status(201).send(result);
	},
};
