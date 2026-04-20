import type { FastifyReply, FastifyRequest } from "fastify";
import { getAppointmentsByCustomerUseCase } from "@/http/useCases/appointments/get-appointments-by-customer-use-case";
import type { GetAppointmentsByCustomerParamsSchema } from "@/schemas/routes/appointments/get-appointments-by-customer";

export const getAppointmentsByCustomerController = {
	async handle(
		request: FastifyRequest<{ Params: GetAppointmentsByCustomerParamsSchema }>,
		reply: FastifyReply,
	) {
		const { customerId } = request.params;

		// Verify user is authenticated - this triggers the auth middleware
		await request.getCurrentUserId();

		const result = await getAppointmentsByCustomerUseCase.execute(customerId);

		return reply.status(200).send(result);
	},
};
