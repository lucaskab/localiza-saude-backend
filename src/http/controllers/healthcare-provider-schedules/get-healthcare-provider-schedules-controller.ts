import type { FastifyReply, FastifyRequest } from "fastify";
import { getHealthcareProviderSchedulesUseCase } from "@/http/useCases/healthcare-provider-schedules/get-healthcare-provider-schedules-use-case";

export const getHealthcareProviderSchedulesController = {
	async handle(request: FastifyRequest, reply: FastifyReply) {
		const result = await getHealthcareProviderSchedulesUseCase.execute();

		return reply.status(200).send(result);
	},
};
