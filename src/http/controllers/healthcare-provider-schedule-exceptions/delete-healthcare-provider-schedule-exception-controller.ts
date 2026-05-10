import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteHealthcareProviderScheduleExceptionUseCase } from "@/http/useCases/healthcare-provider-schedule-exceptions/delete-healthcare-provider-schedule-exception-use-case";
import type { DeleteHealthcareProviderScheduleExceptionParamsSchema } from "@/schemas/routes/healthcare-provider-schedule-exceptions/delete-healthcare-provider-schedule-exception";

export const deleteHealthcareProviderScheduleExceptionController = {
	async handle(
		request: FastifyRequest<{
			Params: DeleteHealthcareProviderScheduleExceptionParamsSchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const { id } = request.params;

		await deleteHealthcareProviderScheduleExceptionUseCase.execute(user, id);

		return reply.status(204).send();
	},
};
