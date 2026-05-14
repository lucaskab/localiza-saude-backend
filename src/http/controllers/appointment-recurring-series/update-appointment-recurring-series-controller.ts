import type { FastifyReply, FastifyRequest } from "fastify";
import { updateAppointmentRecurringSeriesUseCase } from "@/http/useCases/appointment-recurring-series/update-appointment-recurring-series-use-case";
import type {
	UpdateAppointmentRecurringSeriesBodySchema,
	UpdateAppointmentRecurringSeriesParamsSchema,
} from "@/schemas/routes/appointment-recurring-series/update-appointment-recurring-series";

export const updateAppointmentRecurringSeriesController = {
	async handle(
		request: FastifyRequest<{
			Params: UpdateAppointmentRecurringSeriesParamsSchema;
			Body: UpdateAppointmentRecurringSeriesBodySchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const result = await updateAppointmentRecurringSeriesUseCase.execute(
			user,
			request.params.id,
			request.body,
		);

		return reply.status(200).send(result);
	},
};
