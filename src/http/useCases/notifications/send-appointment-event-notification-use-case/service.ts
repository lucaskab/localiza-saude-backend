import type { AppointmentWithRelations } from "@/http/repositories/appointments/appointments-repository-contract";
import { pushNotificationsService } from "@/http/services/push-notifications.service";

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
	appointment.customer?.name ||
	"Paciente";

const getProcedureNames = (appointment: AppointmentWithRelations) =>
	appointment.appointmentProcedures
		.map((appointmentProcedure) => appointmentProcedure.procedure.name)
		.join(", ");

type PushNotificationsDependency = Pick<
	typeof pushNotificationsService,
	"sendToUser"
>;

export const createSendAppointmentEventNotificationUseCase = (
	dependencies: PushNotificationsDependency,
) => ({
	async sendNewAppointmentRequestToProvider(appointment: AppointmentWithRelations) {
		const providerUserId = appointment.healthcareProvider.id;

		await dependencies.sendToUser({
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
		const customerId = appointment.customer?.id;

		if (!customerId) {
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

		await dependencies.sendToUser({
			userId: customerId,
			type: "APPOINTMENT_STATUS_UPDATE",
			title: "Atualizacao da consulta",
			body: `Sua consulta com ${appointment.healthcareProvider.name} foi ${statusLabel}.`,
			appointmentId: appointment.id,
			data: {
				screen: "appointment",
				appointmentId: appointment.id,
				status: appointment.status,
			},
		});
	},
});

export const sendAppointmentEventNotificationUseCase =
	createSendAppointmentEventNotificationUseCase(pushNotificationsService);
