import { prismaNotificationsRepository } from "@/http/repositories/notifications/notifications-repository-implementation";
import { pushNotificationsService } from "@/http/services/push-notifications.service";

const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

const formatAppointmentDate = (date: Date) =>
	new Intl.DateTimeFormat("pt-BR", {
		weekday: "long",
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "America/Sao_Paulo",
	}).format(date);

const getPatientName = (
	appointment: Awaited<
		ReturnType<
			typeof prismaNotificationsRepository.findUpcomingAppointmentsMissingReminder
		>
	>[number],
) =>
	appointment.patientProfile?.fullName ||
	appointment.customer?.user.name ||
	"paciente";

export const sendDueAppointmentRemindersUseCase = {
	async execute(now = new Date()) {
		const until = new Date(now.getTime() + TWENTY_FOUR_HOURS_IN_MS);
		const appointments =
			await prismaNotificationsRepository.findUpcomingAppointmentsMissingReminder(
				now,
				until,
			);

		const summary = {
			processed: appointments.length,
			sent: 0,
			skipped: 0,
			failed: 0,
		};

		for (const appointment of appointments) {
			const customerUserId = appointment.customer?.userId;

			if (!customerUserId) {
				summary.skipped += 1;
				continue;
			}

			const result = await pushNotificationsService.sendToUser({
				userId: customerUserId,
				type: "APPOINTMENT_REMINDER",
				title: "Confirme sua consulta",
				body: `${getPatientName(appointment)}, sua consulta com ${appointment.healthcareProvider.user.name} esta marcada para ${formatAppointmentDate(appointment.scheduledAt)}.`,
				appointmentId: appointment.id,
				recordDelivery: true,
				data: {
					screen: "appointment",
					appointmentId: appointment.id,
					status: appointment.status,
				},
			});

			if (result.status === "sent") {
				summary.sent += 1;
			} else if (result.status === "skipped") {
				summary.skipped += 1;
			} else {
				summary.failed += 1;
			}
		}

		return summary;
	},
};
