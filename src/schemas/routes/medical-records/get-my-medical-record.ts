import { medicalRecordResponseSchema } from "./medical-record";

export const getMyMedicalRecordRouteOptions = {
	schema: {
		tags: ["Medical Records"],
		summary: "Get the authenticated customer's medical record",
		security: [{ bearerAuth: [] }],
		response: {
			200: medicalRecordResponseSchema,
		},
	},
};
