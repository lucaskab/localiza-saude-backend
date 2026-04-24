import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getCustomerMedicalRecordController } from "@/http/controllers/medical-records/get-customer-medical-record-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getCustomerMedicalRecordRouteOptions } from "@/schemas/routes/medical-records/get-customer-medical-record";

const getCustomerMedicalRecord = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/customers/:customerId/medical-record",
			getCustomerMedicalRecordRouteOptions,
			getCustomerMedicalRecordController.handle,
		);
};

export default getCustomerMedicalRecord;
