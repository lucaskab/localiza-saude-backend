import { z } from "zod";
import { patientProfileBodySchema } from "@/schemas/routes/patient-profiles/patient-profile";
import { appointmentSchema } from "./get-appointments";

export const appointmentPatientSchema = z
	.discriminatedUnion("type", [
		z.object({
			type: z.literal("SELF"),
		}),
		z.object({
			type: z.literal("EXISTING_PROFILE"),
			patientProfileId: z.cuid(),
		}),
		z.object({
			type: z.literal("NEW_PROFILE"),
			profile: patientProfileBodySchema,
		}),
	])
	.optional();

export const createAppointmentBodySchema = z.object({
	healthcareProviderId: z.cuid().optional(),
	scheduledAt: z.string().datetime().transform((val) => new Date(val)),
	procedureIds: z.array(z.cuid()).min(1),
	notes: z.string().nullable().optional(),
	patient: appointmentPatientSchema,
});

export const createAppointmentResponseSchema = z.object({
	appointment: appointmentSchema,
});

export type CreateAppointmentBodySchema = z.infer<
	typeof createAppointmentBodySchema
>;
export type CreateAppointmentResponseSchema = z.infer<
	typeof createAppointmentResponseSchema
>;

export const createAppointmentRouteOptions = {
	schema: {
		tags: ["Appointments"],
		summary: "Create a new appointment",
		security: [{ bearerAuth: [] }],
		body: createAppointmentBodySchema,
		response: {
			201: createAppointmentResponseSchema,
		},
	},
};
