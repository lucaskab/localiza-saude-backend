import {
	patientProfileBodySchema,
	patientProfileResponseSchema,
} from "./patient-profile";
import { z } from "zod";

export type CreatePatientProfileBodySchema = z.infer<
	typeof patientProfileBodySchema
>;

export const createPatientProfileRouteOptions = {
	schema: {
		tags: ["Customer Profiles"],
		summary: "Create a customer profile for someone without an account",
		security: [{ bearerAuth: [] }],
		body: patientProfileBodySchema,
		response: {
			201: patientProfileResponseSchema,
		},
	},
};
