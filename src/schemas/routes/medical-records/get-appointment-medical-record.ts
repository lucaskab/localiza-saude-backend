import { z } from "zod";
import { medicalRecordResponseSchema } from "./medical-record";

export const getAppointmentMedicalRecordParamsSchema = z.object({
	appointmentId: z.cuid(),
});

export type GetAppointmentMedicalRecordParamsSchema = z.infer<
	typeof getAppointmentMedicalRecordParamsSchema
>;

export const getAppointmentMedicalRecordRouteOptions = {
	schema: {
		tags: ["Medical Records"],
		summary: "Get the medical record for a confirmed appointment",
		description:
			"Healthcare providers can read a patient's medical record only for confirmed appointments they own, and only when the patient has filled at least one medical record field.",
		security: [{ bearerAuth: [] }],
		params: getAppointmentMedicalRecordParamsSchema,
		response: {
			200: medicalRecordResponseSchema,
		},
	},
};
