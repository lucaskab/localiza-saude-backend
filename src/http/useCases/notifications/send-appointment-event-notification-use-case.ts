import { pushNotificationsService } from "@/http/services/push-notifications.service";
import type { AppointmentWithRelations } from "@/http/repositories/appointments/appointments-repository-contract";

const formatAppointmentDate = (date: Date) =>
	new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "America/Sao_Paulo",
	}).format(date);

const getPatientName = (appointment: AppointmentWithRelations) =>
	appointment.patientProfile?.fullName ||
	appointment.customer?.user.name ||
	"Paciente";

const getProcedureNames = (appointment: AppointmentWithRelations) =>
	appointment.appointmentProcedures
		.map((appointmentProcedure) => appointmentProcedure.procedure.name)
		.join(", ");

export const sendAppointmentEventNotificationUseCase = {
	async sendNewAppointmentRequestToProvider(appointment: AppointmentWithRelations) {
		const providerUserId = appointment.healthcareProvider.userId;

		await pushNotificationsService.sendToUser({
			userId: providerUserId,
			type: "NEW_APPOINTMENT_REQUEST",
			title: "Nova consulta solicitada",
			body: `${getPatientName(appointment)} solicitou ${getProcedureNames(appointment)} para ${formatAppointmentDate(appointment.scheduledAt)}.`,
			appointmentId: appointment.id,
			data: {
				screen: "appointment",
				appointmentId: appointment.id,
				status: appointment.status,
			},
		});
	},

	async sendAppointmentStatusUpdateToCustomer(
		appointment: AppointmentWithRelations,
	) {
		const customerUserId = appointment.customer?.userId;

		if (!customerUserId) {
			return;
		}

		const statusLabel = {
			SCHEDULED: "agendada",
			CONFIRMED: "confirmada",
			IN_PROGRESS: "iniciada",
			COMPLETED: "concluida",
			CANCELLED: "cancelada",
			NO_SHOW: "marcada como ausencia",
		}[appointment.status];

		await pushNotificationsService.sendToUser({
			userId: customerUserId,
			type: "APPOINTMENT_STATUS_UPDATE",
			title: "Atualizacao da consulta",
			body: `Sua consulta com ${appointment.healthcareProvider.user.name} foi ${statusLabel}.`,
			appointmentId: appointment.id,
			data: {
				screen: "appointment",
				appointmentId: appointment.id,
				status: appointment.status,
			},
		});
	},
};
