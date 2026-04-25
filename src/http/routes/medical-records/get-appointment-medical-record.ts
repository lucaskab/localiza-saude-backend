import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getAppointmentMedicalRecordController } from "@/http/controllers/medical-records/get-appointment-medical-record-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getAppointmentMedicalRecordRouteOptions } from "@/schemas/routes/medical-records/get-appointment-medical-record";

const getAppointmentMedicalRecord = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/appointments/:appointmentId/medical-record",
			getAppointmentMedicalRecordRouteOptions,
			getAppointmentMedicalRecordController.handle,
		);
};

export default getAppointmentMedicalRecord;
