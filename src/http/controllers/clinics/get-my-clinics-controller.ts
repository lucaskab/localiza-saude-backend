import type { FastifyReply, FastifyRequest } from "fastify";
import { getMyClinicsUseCase } from "@/http/useCases/clinics/get-my-clinics-use-case";

export const getMyClinicsController = {
	async handle(request: FastifyRequest, reply: FastifyReply) {
		const user = await request.getCurrentUser();
		const result = await getMyClinicsUseCase.execute(user);

		return reply.status(200).send(result);
	},
};
