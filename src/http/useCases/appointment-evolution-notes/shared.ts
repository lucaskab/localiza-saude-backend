import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import type { AppointmentWithRelations } from "@/http/repositories/appointments/appointments-repository-contract";
import type { user } from "../../../../prisma/generated/prisma/client";

export async function getProviderOwnedAppointmentOrThrow(
	appointmentId: string,
	currentUser: user,
) {
	const appointment = await prismaAppointmentRepository.findById(appointmentId);

	if (!appointment) {
		throw new BadRequestError("Appointment not found");
	}

	if (currentUser.role === "ADMIN") {
		return appointment;
	}

	if (
		currentUser.role !== "HEALTHCARE_PROVIDER" ||
		appointment.healthcareProviderId !== currentUser.id
	) {
		throw new UnauthorizedError(
			"You cannot access this appointment evolution note",
		);
	}

	return appointment;
}

export function assertAppointmentAllowsEvolutionNote(appointment: AppointmentWithRelations) {
	if (!["IN_PROGRESS", "COMPLETED"].includes(appointment.status)) {
		throw new BadRequestError(
			"Evolution notes can only be saved after the appointment starts",
		);
	}
}
