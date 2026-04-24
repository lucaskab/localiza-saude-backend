import {
	medicalRecordBodySchema,
	medicalRecordSchema,
} from "./medical-record";
import { z } from "zod";

export const upsertMyMedicalRecordResponseSchema = z.object({
	medicalRecord: medicalRecordSchema,
});

export type UpsertMyMedicalRecordBodySchema = z.infer<
	typeof medicalRecordBodySchema
>;

export const upsertMyMedicalRecordRouteOptions = {
	schema: {
		tags: ["Medical Records"],
		summary: "Create or update the authenticated customer's medical record",
		security: [{ bearerAuth: [] }],
		body: medicalRecordBodySchema,
		response: {
			200: upsertMyMedicalRecordResponseSchema,
		},
	},
};
