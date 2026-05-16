import type {
	AppointmentEvolutionStatus,
	appointment_evolution_note,
	appointment,
} from "../../../../prisma/generated/prisma/client";

export type AppointmentEvolutionNoteInput = {
	subjective?: string | null;
	objective?: string | null;
	assessment?: string | null;
	plan?: string | null;
	painLevel?: number | null;
	painLocation?: string | null;
	evolutionStatus?: AppointmentEvolutionStatus | null;
};

export type AppointmentEvolutionNoteWithAppointment = appointment_evolution_note & {
	appointment: Pick<appointment, "id" | "scheduledAt" | "status">;
};

export type AppointmentEvolutionNotesRepository = {
	findByAppointmentId: (
		appointmentId: string,
	) => Promise<AppointmentEvolutionNoteWithAppointment | null>;
	findHistory: (params: {
		healthcareProviderId: string;
		customerId?: string | null;
		patientProfileId?: string | null;
		excludeAppointmentId?: string;
		limit?: number;
	}) => Promise<AppointmentEvolutionNoteWithAppointment[]>;
	upsertByAppointmentId: (params: {
		appointmentId: string;
		customerId?: string | null;
		patientProfileId?: string | null;
		healthcareProviderId: string;
		data: AppointmentEvolutionNoteInput;
	}) => Promise<AppointmentEvolutionNoteWithAppointment>;
};
