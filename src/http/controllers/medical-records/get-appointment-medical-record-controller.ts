import type { FastifyReply, FastifyRequest } from "fastify";
import { getAppointmentMedicalRecordUseCase } from "@/http/useCases/medical-records/get-medical-record-use-case";
import type { GetAppointmentMedicalRecordParamsSchema } from "@/schemas/routes/medical-records/get-appointment-medical-record";

export const getAppointmentMedicalRecordController = {
	async handle(
		request: FastifyRequest<{
			Params: GetAppointmentMedicalRecordParamsSchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const result = await getAppointmentMedicalRecordUseCase.execute(
			request.params.appointmentId,
			user,
		);

		return reply.status(200).send(result);
	},
};
