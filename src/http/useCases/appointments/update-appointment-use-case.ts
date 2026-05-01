import type {
	AppointmentWithRelations,
	UpdateAppointmentData,
} from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { sendAppointmentEventNotificationUseCase } from "@/http/useCases/notifications/send-appointment-event-notification-use-case";

export const updateAppointmentUseCase = {
	async execute(
		id: string,
		data: UpdateAppointmentData,
	): Promise<{ appointment: AppointmentWithRelations }> {
		const previousAppointment = await prismaAppointmentRepository.findById(id);
		const appointment = await prismaAppointmentRepository.update(id, data);

		if (
			data.status &&
			previousAppointment &&
			previousAppointment.status !== appointment.status
		) {
			await sendAppointmentEventNotificationUseCase
				.sendAppointmentStatusUpdateToCustomer(appointment)
				.catch((error) => {
					console.error("Failed to send appointment status notification:", error);
				});
		}

		return { appointment };
	},
};
