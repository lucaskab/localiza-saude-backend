import type {
	AppointmentWithRelations,
	UpdateAppointmentData,
} from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import { googleMeetService } from "@/http/services/google-meet-service";
import { sendAppointmentEventNotificationUseCase } from "@/http/useCases/notifications/send-appointment-event-notification-use-case";
import type { user } from "../../../../prisma/generated/prisma/client";

async function assertCanUpdateAppointment(
	currentUser: user,
	appointment: AppointmentWithRelations,
) {
	if (
		appointment.customerId === currentUser.id ||
		appointment.patientProfile?.customerOwnerId === currentUser.id ||
		appointment.healthcareProviderId === currentUser.id ||
		currentUser.role === "ADMIN"
	) {
		return;
	}

	if (currentUser.role === "STAFF" || currentUser.role === "HEALTHCARE_PROVIDER") {
		await clinicRbac.assertCanManageProvider(
			currentUser,
			appointment.healthcareProviderId,
			"MANAGE_APPOINTMENTS",
		);
		return;
	}

	throw new UnauthorizedError("You cannot update this appointment");
}

export const updateAppointmentUseCase = {
	async execute(
		currentUser: user,
		id: string,
		data: UpdateAppointmentData,
	): Promise<{ appointment: AppointmentWithRelations }> {
		const previousAppointment = await prismaAppointmentRepository.findById(id);

		if (!previousAppointment) {
			throw new BadRequestError("Appointment not found");
		}

		await assertCanUpdateAppointment(currentUser, previousAppointment);

		let appointment = await prismaAppointmentRepository.update(id, data);

		if (
			data.status &&
			previousAppointment &&
			previousAppointment.status !== appointment.status
		) {
			if (appointment.status === "CONFIRMED") {
				appointment = await googleMeetService
					.ensureOnlineMeeting(appointment)
					.catch((error) => {
						console.error("Failed to create Google Meet link:", error);
						return appointment;
					});
			}

			await sendAppointmentEventNotificationUseCase
				.sendAppointmentStatusUpdateToCustomer(appointment)
				.catch((error) => {
					console.error("Failed to send appointment status notification:", error);
				});
		}

		return { appointment };
	},
};
