import type { FastifyReply, FastifyRequest } from "fastify";
import { updateHealthcareProviderScheduleUseCase } from "@/http/useCases/healthcare-provider-schedules/update-healthcare-provider-schedule-use-case";
import type {
	UpdateHealthcareProviderScheduleBodySchema,
	UpdateHealthcareProviderScheduleParamsSchema,
} from "@/schemas/routes/healthcare-provider-schedules/update-healthcare-provider-schedule";

export const updateHealthcareProviderScheduleController = {
	async handle(
		request: FastifyRequest<{
			Params: UpdateHealthcareProviderScheduleParamsSchema;
			Body: UpdateHealthcareProviderScheduleBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const { id } = request.params;
		const data = request.body;

		const result = await updateHealthcareProviderScheduleUseCase.execute(
			id,
			data,
		);

		return reply.status(200).send(result);
	},
};
