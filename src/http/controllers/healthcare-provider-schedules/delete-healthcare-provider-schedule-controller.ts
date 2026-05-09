import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteHealthcareProviderScheduleUseCase } from "@/http/useCases/healthcare-provider-schedules/delete-healthcare-provider-schedule-use-case";
import type { DeleteHealthcareProviderScheduleParamsSchema } from "@/schemas/routes/healthcare-provider-schedules/delete-healthcare-provider-schedule";

export const deleteHealthcareProviderScheduleController = {
	async handle(
		request: FastifyRequest<{
			Params: DeleteHealthcareProviderScheduleParamsSchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const { id } = request.params;

		await deleteHealthcareProviderScheduleUseCase.execute(user, id);

		return reply.status(204).send();
	},
};
