import { prismaAppointmentEvolutionNotesRepository } from "@/http/repositories/appointment-evolution-notes/appointment-evolution-notes-repository-implementation";
import type { AppointmentEvolutionNoteWithAppointment } from "@/http/repositories/appointment-evolution-notes/appointment-evolution-notes-repository-contract";
import { getProviderOwnedAppointmentOrThrow } from "../shared";
import type { user } from "../../../../../prisma/generated/prisma/client";

export const getAppointmentEvolutionNoteUseCase = {
	async execute(
		appointmentId: string,
		currentUser: user,
	): Promise<{
		evolutionNote: AppointmentEvolutionNoteWithAppointment | null;
		history: AppointmentEvolutionNoteWithAppointment[];
	}> {
		const appointment = await getProviderOwnedAppointmentOrThrow(
			appointmentId,
			currentUser,
		);

		const evolutionNote =
			await prismaAppointmentEvolutionNotesRepository.findByAppointmentId(
				appointment.id,
			);

		if (
			!["IN_PROGRESS", "COMPLETED"].includes(appointment.status) &&
			!evolutionNote
		) {
			return { evolutionNote: null, history: [] };
		}

		const history = await prismaAppointmentEvolutionNotesRepository.findHistory({
			healthcareProviderId: appointment.healthcareProviderId,
			customerId: appointment.customerId,
			patientProfileId: appointment.patientProfileId,
			excludeAppointmentId: appointment.id,
		});

		return { evolutionNote, history };
	},
};
