import { patientProfilesResponseSchema } from "./patient-profile";

export const getPatientProfilesRouteOptions = {
	schema: {
		tags: ["Patient Profiles"],
		summary: "Get accessible patient profiles",
		description:
			"Customers see profiles they manage. Healthcare providers see profiles they created or profiles attached to their appointments.",
		security: [{ bearerAuth: [] }],
		response: {
			200: patientProfilesResponseSchema,
		},
	},
};
