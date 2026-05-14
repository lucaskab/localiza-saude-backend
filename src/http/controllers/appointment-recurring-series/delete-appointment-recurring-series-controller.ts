import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteAppointmentRecurringSeriesUseCase } from "@/http/useCases/appointment-recurring-series/delete-appointment-recurring-series-use-case";
import type { DeleteAppointmentRecurringSeriesParamsSchema } from "@/schemas/routes/appointment-recurring-series/delete-appointment-recurring-series";

export const deleteAppointmentRecurringSeriesController = {
	async handle(
		request: FastifyRequest<{
			Params: DeleteAppointmentRecurringSeriesParamsSchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const result = await deleteAppointmentRecurringSeriesUseCase.execute(
			user,
			request.params.id,
		);

		return reply.status(200).send(result);
	},
};
