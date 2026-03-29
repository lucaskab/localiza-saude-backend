import type { FastifyReply } from "fastify";
import type { FastifyRequest } from "fastify/types/request";
import { getClinicsUseCase } from "@/http/useCases/clinics/get-clinics-use-case";

export const getClinicsController = {
	async handle(_: FastifyRequest, reply: FastifyReply) {
		const clinics = await getClinicsUseCase.execute();

		return reply.status(200).send(clinics);
	},
};
