import { prisma } from "@/database/prisma";
import type {
	AppointmentEvolutionNotesRepository,
} from "./appointment-evolution-notes-repository-contract";

const includeAppointment = {
	appointment: {
		select: {
			id: true,
			scheduledAt: true,
			status: true,
		},
	},
};

export const prismaAppointmentEvolutionNotesRepository: AppointmentEvolutionNotesRepository =
	{
		async findByAppointmentId(appointmentId) {
			return prisma.appointment_evolution_note.findUnique({
				where: { appointmentId },
				include: includeAppointment,
			});
		},

		async findHistory({
			healthcareProviderId,
			customerId,
			patientProfileId,
			excludeAppointmentId,
			limit = 8,
		}) {
			if (!customerId && !patientProfileId) {
				return [];
			}

			return prisma.appointment_evolution_note.findMany({
				where: {
					healthcareProviderId,
					...(excludeAppointmentId
						? {
								appointmentId: {
									not: excludeAppointmentId,
								},
						  }
						: {}),
					OR: [
						...(customerId ? [{ customerId }] : []),
						...(patientProfileId ? [{ patientProfileId }] : []),
					],
				},
				include: includeAppointment,
				orderBy: {
					appointment: {
						scheduledAt: "desc",
					},
				},
				take: limit,
			});
		},

		async upsertByAppointmentId({
			appointmentId,
			customerId,
			patientProfileId,
			healthcareProviderId,
			data,
		}) {
			return prisma.appointment_evolution_note.upsert({
				where: { appointmentId },
				create: {
					appointmentId,
					customerId,
					patientProfileId,
					healthcareProviderId,
					...data,
				},
				update: {
					customerId,
					patientProfileId,
					healthcareProviderId,
					...data,
				},
				include: includeAppointment,
			});
		},
	};
