import type { FastifyReply, FastifyRequest } from "fastify";
import { createHealthcareProviderScheduleExceptionUseCase } from "@/http/useCases/healthcare-provider-schedule-exceptions/create-healthcare-provider-schedule-exception-use-case";
import type { CreateHealthcareProviderScheduleExceptionBodySchema } from "@/schemas/routes/healthcare-provider-schedule-exceptions/create-healthcare-provider-schedule-exception";

export const createHealthcareProviderScheduleExceptionController = {
	async handle(
		request: FastifyRequest<{
			Body: CreateHealthcareProviderScheduleExceptionBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const data = request.body;

		const result =
			await createHealthcareProviderScheduleExceptionUseCase.execute(user, data);

		return reply.status(201).send(result);
	},
};
