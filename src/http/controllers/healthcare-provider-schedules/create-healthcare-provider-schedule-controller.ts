import type { FastifyReply, FastifyRequest } from "fastify";
import { createHealthcareProviderScheduleUseCase } from "@/http/useCases/healthcare-provider-schedules/create-healthcare-provider-schedule-use-case";
import type { CreateHealthcareProviderScheduleBodySchema } from "@/schemas/routes/healthcare-provider-schedules/create-healthcare-provider-schedule";

export const createHealthcareProviderScheduleController = {
	async handle(
		request: FastifyRequest<{
			Body: CreateHealthcareProviderScheduleBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const data = request.body;

		const result = await createHealthcareProviderScheduleUseCase.execute(
			user,
			data,
		);

		return reply.status(201).send(result);
	},
};
