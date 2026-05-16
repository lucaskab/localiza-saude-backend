import { prismaAppointmentEvolutionNotesRepository } from "@/http/repositories/appointment-evolution-notes/appointment-evolution-notes-repository-implementation";
import type { AppointmentEvolutionNoteInput, AppointmentEvolutionNoteWithAppointment } from "@/http/repositories/appointment-evolution-notes/appointment-evolution-notes-repository-contract";
import {
	assertAppointmentAllowsEvolutionNote,
	getProviderOwnedAppointmentOrThrow,
} from "../shared";
import type { user } from "../../../../../prisma/generated/prisma/client";

export const upsertAppointmentEvolutionNoteUseCase = {
	async execute(
		appointmentId: string,
		currentUser: user,
		data: AppointmentEvolutionNoteInput,
	): Promise<{
		evolutionNote: AppointmentEvolutionNoteWithAppointment;
		history: AppointmentEvolutionNoteWithAppointment[];
	}> {
		const appointment = await getProviderOwnedAppointmentOrThrow(
			appointmentId,
			currentUser,
		);

		assertAppointmentAllowsEvolutionNote(appointment);

		const evolutionNote =
			await prismaAppointmentEvolutionNotesRepository.upsertByAppointmentId({
				appointmentId: appointment.id,
				customerId: appointment.customerId,
				patientProfileId: appointment.patientProfileId,
				healthcareProviderId: appointment.healthcareProviderId,
				data,
			});

		const history = await prismaAppointmentEvolutionNotesRepository.findHistory({
			healthcareProviderId: appointment.healthcareProviderId,
			customerId: appointment.customerId,
			patientProfileId: appointment.patientProfileId,
			excludeAppointmentId: appointment.id,
		});

		return { evolutionNote, history };
	},
};
