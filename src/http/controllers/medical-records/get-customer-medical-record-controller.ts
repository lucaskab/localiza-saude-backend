import type { FastifyReply, FastifyRequest } from "fastify";
import { getCustomerMedicalRecordUseCase } from "@/http/useCases/medical-records/get-medical-record-use-case";
import type { GetCustomerMedicalRecordParamsSchema } from "@/schemas/routes/medical-records/get-customer-medical-record";

export const getCustomerMedicalRecordController = {
	async handle(
		request: FastifyRequest<{
			Params: GetCustomerMedicalRecordParamsSchema;
		}>,
		reply: FastifyReply,
	) {
		const user = await request.getCurrentUser();
		const result = await getCustomerMedicalRecordUseCase.execute(
			request.params.customerId,
			user,
		);

		return reply.status(200).send(result);
	},
};
