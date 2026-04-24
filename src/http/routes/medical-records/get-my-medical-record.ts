import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getMyMedicalRecordController } from "@/http/controllers/medical-records/get-my-medical-record-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getMyMedicalRecordRouteOptions } from "@/schemas/routes/medical-records/get-my-medical-record";

const getMyMedicalRecord = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/medical-record",
			getMyMedicalRecordRouteOptions,
			getMyMedicalRecordController.handle,
		);
};

export default getMyMedicalRecord;
