import { prisma } from "@/database/prisma";
import type {
	AppointmentWithRelations,
	CreateAppointmentData,
} from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

function hasDateOverlap(
	startA: Date,
	endA: Date,
	startB: Date,
	endB: Date,
): boolean {
	return startA < endB && endA > startB;
}

export const createAppointmentUseCase = {
	async execute(
		data: CreateAppointmentData,
	): Promise<{ appointment: AppointmentWithRelations }> {
		// Validate healthcare provider exists
		const healthcareProvider = await prisma.healthcare_provider.findUnique({
			where: { id: data.healthcareProviderId },
		});

		if (!healthcareProvider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		const procedures = await prisma.procedure.findMany({
			where: {
				id: { in: data.procedureIds },
				healthcareProviderId: data.healthcareProviderId,
			},
		});

		if (procedures.length !== data.procedureIds.length) {
			throw new BadRequestError(
				"One or more procedures not found or do not belong to this provider",
			);
		}

		const totalDurationMinutes = procedures.reduce(
			(total, procedure) => total + procedure.durationInMinutes,
			0,
		);

		const appointmentStart = new Date(data.scheduledAt);
		const appointmentEnd = new Date(
			appointmentStart.getTime() + totalDurationMinutes * 60 * 1000,
		);

		const startOfDay = new Date(appointmentStart);
		startOfDay.setUTCHours(0, 0, 0, 0);
		const endOfDay = new Date(appointmentStart);
		endOfDay.setUTCHours(23, 59, 59, 999);

		const existingAppointments =
			await prismaAppointmentRepository.findByProviderAndDateRange(
				data.healthcareProviderId,
				{
					startDate: startOfDay,
					endDate: endOfDay,
				},
			);

		const hasConflict = existingAppointments.some((appointment) => {
			const existingStart = new Date(appointment.scheduledAt);
			const existingEnd = new Date(
				existingStart.getTime() +
					appointment.totalDurationMinutes * 60 * 1000,
			);

			return hasDateOverlap(
				appointmentStart,
				appointmentEnd,
				existingStart,
				existingEnd,
			);
		});

		if (hasConflict) {
			throw new BadRequestError(
				"This time slot is no longer available for this provider",
			);
		}

		const appointment = await prismaAppointmentRepository.create(data);

		return { appointment };
	},
};
