import type { FastifyReply, FastifyRequest } from "fastify";
import { getAppointmentsUseCase } from "@/http/useCases/appointments/get-appointments-use-case";
import type { GetAppointmentsQuerySchema } from "@/schemas/routes/appointments/get-appointments";

export const getAppointmentsController = {
	async handle(
		request: FastifyRequest<{ Querystring: GetAppointmentsQuerySchema }>,
		reply: FastifyReply,
	) {
		const { healthcareProviderId, startDate, endDate } = request.query;

		// Adjust endDate to include the entire day (23:59:59.999)
		let endDateObj: Date | undefined;
		if (endDate) {
			endDateObj = new Date(endDate);
			endDateObj.setHours(23, 59, 59, 999);
		}

		const filters = {
			healthcareProviderId,
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDateObj,
		};

		const result = await getAppointmentsUseCase.execute(filters);

		return reply.status(200).send(result);
	},
};
