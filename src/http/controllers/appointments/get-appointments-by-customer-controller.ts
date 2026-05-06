import type { FastifyReply, FastifyRequest } from "fastify";
import { getAppointmentsByCustomerUseCase } from "@/http/useCases/appointments/get-appointments-by-customer-use-case";
import type {
	GetAppointmentsByCustomerParamsSchema,
	GetAppointmentsByCustomerQuerySchema,
} from "@/schemas/routes/appointments/get-appointments-by-customer";

export const getAppointmentsByCustomerController = {
	async handle(
		request: FastifyRequest<{
			Params: GetAppointmentsByCustomerParamsSchema;
			Querystring: GetAppointmentsByCustomerQuerySchema;
		}>,
		reply: FastifyReply,
	) {
		const { customerId } = request.params;
		const { status, search, startDate, endDate, limit, offset } = request.query;

		// Verify user is authenticated - this triggers the auth middleware
		await request.getCurrentUserId();

		let endDateObj: Date | undefined;
		if (endDate) {
			endDateObj = new Date(endDate);
			endDateObj.setHours(23, 59, 59, 999);
		}

		const result = await getAppointmentsByCustomerUseCase.execute(customerId, {
			status,
			search,
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDateObj,
			limit,
			offset,
		});

		return reply.status(200).send(result);
	},
};
