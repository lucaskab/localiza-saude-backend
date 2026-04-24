import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { upsertMyMedicalRecordController } from "@/http/controllers/medical-records/upsert-my-medical-record-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { upsertMyMedicalRecordRouteOptions } from "@/schemas/routes/medical-records/upsert-my-medical-record";

const upsertMyMedicalRecord = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.put(
			"/medical-record",
			upsertMyMedicalRecordRouteOptions,
			upsertMyMedicalRecordController.handle,
		);
};

export default upsertMyMedicalRecord;
