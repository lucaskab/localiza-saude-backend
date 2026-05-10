import type { FastifyReply, FastifyRequest } from "fastify";
import { updateHealthcareProviderScheduleExceptionUseCase } from "@/http/useCases/healthcare-provider-schedule-exceptions/update-healthcare-provider-schedule-exception-use-case";
import type {
	UpdateHealthcareProviderScheduleExceptionBodySchema,
	UpdateHealthcareProviderScheduleExceptionParamsSchema,
} from "@/schemas/routes/healthcare-provider-schedule-exceptions/update-healthcare-provider-schedule-exception";

export const updateHealthcareProviderScheduleExceptionController = {
	async handle(
		request: FastifyRequest<{
			Params: UpdateHealthcareProviderScheduleExceptionParamsSchema;
			Body: UpdateHealthcareProviderScheduleExceptionBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const { id } = request.params;
		const data = request.body;

		const result =
			await updateHealthcareProviderScheduleExceptionUseCase.execute(
				user,
				id,
				data,
			);

		return reply.status(200).send(result);
	},
};
