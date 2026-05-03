import type { FastifyReply, FastifyRequest } from "fastify";
import { getAppInfoUseCase } from "@/http/useCases/settings/get-app-info-use-case";

export const getAppInfoController = {
	async handle(_request: FastifyRequest, reply: FastifyReply) {
		const result = await getAppInfoUseCase.execute();

		return reply.status(200).send(result);
	},
};
