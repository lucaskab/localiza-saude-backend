import type {
	AppointmentWithRelations,
	UpdateAppointmentData,
} from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { googleMeetService } from "@/http/services/google-meet-service";
import { sendAppointmentEventNotificationUseCase } from "@/http/useCases/notifications/send-appointment-event-notification-use-case";

export const updateAppointmentUseCase = {
	async execute(
		id: string,
		data: UpdateAppointmentData,
	): Promise<{ appointment: AppointmentWithRelations }> {
		const previousAppointment = await prismaAppointmentRepository.findById(id);
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
