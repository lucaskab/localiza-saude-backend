import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuthMeUseCase } from "@/http/useCases/auth/get-auth-me-use-case";

export const getAuthMeController = {
	async handle(request: FastifyRequest, reply: FastifyReply) {
		const currentUser = await request.getCurrentUser();
		const result = await getAuthMeUseCase.execute(currentUser);

		return reply.status(200).send(result);
	},
};
