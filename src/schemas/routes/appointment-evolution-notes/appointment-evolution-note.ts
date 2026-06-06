import { z } from "zod";

const optionalEvolutionTextSchema = z.preprocess(
	(value) => {
		if (typeof value !== "string") {
			return value;
		}

		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	},
	z.string().nullable().optional(),
);

export const appointmentEvolutionStatusSchema = z
	.enum(["IMPROVED", "STABLE", "WORSENED"])
	.nullable()
	.optional();

export const appointmentEvolutionNoteSchema = z.object({
	id: z.cuid(),
	appointmentId: z.cuid(),
	customerId: z.cuid().nullable(),
	patientProfileId: z.cuid().nullable(),
	healthcareProviderId: z.cuid(),
	subjective: z.string().nullable(),
	objective: z.string().nullable(),
	assessment: z.string().nullable(),
	plan: z.string().nullable(),
	painLevel: z.number().int().min(0).max(10).nullable(),
	painLocation: z.string().nullable(),
	evolutionStatus: z.enum(["IMPROVED", "STABLE", "WORSENED"]).nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	appointment: z.object({
		id: z.cuid(),
		scheduledAt: z.date(),
		status: z.enum([
			"SCHEDULED",
			"CONFIRMED",
			"IN_PROGRESS",
			"COMPLETED",
			"CANCELLED",
			"NO_SHOW",
		]),
	}),
});

export const appointmentEvolutionNoteBodySchema = z.object({
	subjective: optionalEvolutionTextSchema,
	objective: optionalEvolutionTextSchema,
	assessment: optionalEvolutionTextSchema,
	plan: optionalEvolutionTextSchema,
	painLevel: z.number().int().min(0).max(10).nullable().optional(),
	painLocation: optionalEvolutionTextSchema,
	evolutionStatus: appointmentEvolutionStatusSchema,
});

export const appointmentEvolutionNoteResponseSchema = z.object({
	evolutionNote: appointmentEvolutionNoteSchema.nullable(),
	history: z.array(appointmentEvolutionNoteSchema),
});

export type AppointmentEvolutionNoteBodySchema = z.infer<
	typeof appointmentEvolutionNoteBodySchema
>;
