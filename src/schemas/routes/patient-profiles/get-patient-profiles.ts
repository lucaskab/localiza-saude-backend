import { patientProfilesResponseSchema } from "./patient-profile";

export const getPatientProfilesRouteOptions = {
	schema: {
		tags: ["Customer Profiles"],
		summary: "Get accessible customer profiles",
		description:
			"Customers see profiles they manage. Healthcare providers see profiles they created or profiles attached to their appointments.",
		security: [{ bearerAuth: [] }],
		response: {
			200: patientProfilesResponseSchema,
		},
	},
};
