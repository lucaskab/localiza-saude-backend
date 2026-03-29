import type { FastifyReply, FastifyRequest } from "fastify";
import { createClinicUseCase } from "@/http/useCases/clinics/create-clinic-use-case";
import type { CreateClinicBodySchema } from "@/schemas/routes/clinics/create-clinic";

export const createClinicController = {
	async handle(
		request: FastifyRequest<{ Body: CreateClinicBodySchema }>,
		reply: FastifyReply,
	) {
		const data = request.body;

		const result = await createClinicUseCase.execute(data);

		return reply.status(201).send(result);
	},
};
