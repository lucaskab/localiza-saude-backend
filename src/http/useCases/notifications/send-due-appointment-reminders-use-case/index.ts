import { emailService } from "@/http/services/email.service";
import { prismaNotificationsRepository } from "@/http/repositories/notifications/notifications-repository-implementation";
import { pushNotificationsService } from "@/http/services/push-notifications.service";

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

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
			typeof prismaNotificationsRepository.findUpcomingAppointmentsForReminderWindow
		>
	>[number],
) =>
	appointment.patientProfile?.fullName ||
	appointment.customer?.name ||
	"paciente";

const getReminderDedupeKey = (appointmentId: string) =>
	`appointment:${appointmentId}`;

const buildReminderEmailHtml = ({
	customerName,
	providerName,
	scheduledAt,
}: {
	customerName: string;
	providerName: string;
	scheduledAt: Date;
}) => `
	<div style="background:#f4fbfa;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#16313c;">
		<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d9ebe8;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(20,73,80,.08);">
			<div style="background:linear-gradient(135deg,#1e847f,#146963);padding:28px 32px;color:#ffffff;">
				<div style="font-size:14px;letter-spacing:.08em;text-transform:uppercase;opacity:.82;">Localiza Saúde</div>
				<h1 style="margin:12px 0 0;font-size:28px;line-height:1.15;">Sua consulta começa em 1 hora</h1>
			</div>
			<div style="padding:32px;">
				<p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Olá, <strong>${customerName}</strong>.</p>
				<p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
					Este é um lembrete carinhoso de que sua consulta com <strong>${providerName}</strong> está marcada para
					<strong> ${formatAppointmentDate(scheduledAt)}</strong>.
				</p>
				<div style="margin:24px 0;padding:20px;border-radius:20px;background:#eef8f7;border:1px solid #d8ece8;">
					<div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#5f7783;">Prepare-se com tranquilidade</div>
					<div style="margin-top:10px;font-size:18px;font-weight:700;color:#16313c;">Falta apenas 1 hora</div>
				</div>
				<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#5f7783;">
					Se sua consulta for online, vale a pena conferir seu dispositivo e conexão alguns minutos antes.
				</p>
				<p style="margin:0;font-size:15px;line-height:1.7;color:#5f7783;">
					Estamos aqui para deixar seu cuidado mais leve, organizado e humano.
				</p>
			</div>
		</div>
	</div>
`;

export const sendDueAppointmentRemindersUseCase = {
	async execute(now = new Date()) {
		const until = new Date(now.getTime() + ONE_HOUR_IN_MS);
		const appointments =
			await prismaNotificationsRepository.findUpcomingAppointmentsForReminderWindow(
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
			const customerId = appointment.customer?.id;

			if (!customerId) {
				summary.skipped += 1;
				continue;
			}

			const preference = (
				await pushNotificationsService.getPreferences(customerId)
			).find((item) => item.type === "APPOINTMENT_REMINDER");

			const reminderChannels = {
				push: preference?.pushEnabled ?? true,
				email: preference?.emailEnabled ?? false,
			};
			const dedupeKey = getReminderDedupeKey(appointment.id);

			if (!reminderChannels.push && !reminderChannels.email) {
				summary.skipped += 1;
				continue;
			}

			if (reminderChannels.push) {
				const existingPushDelivery =
					await prismaNotificationsRepository.findDelivery(
						customerId,
						"APPOINTMENT_REMINDER",
						"PUSH",
						dedupeKey,
					);

				if (!existingPushDelivery) {
					const result = await pushNotificationsService.sendToUser({
						userId: customerId,
						type: "APPOINTMENT_REMINDER",
						title: "Sua consulta começa em 1 hora",
						body: `${getPatientName(appointment)}, sua consulta com ${appointment.healthcareProvider.name} acontece às ${formatAppointmentDate(appointment.scheduledAt)}.`,
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
			}

			if (reminderChannels.email && appointment.customer?.email) {
				const existingEmailDelivery =
					await prismaNotificationsRepository.findDelivery(
						customerId,
						"APPOINTMENT_REMINDER",
						"EMAIL",
						dedupeKey,
					);

				if (!existingEmailDelivery) {
					const emailResult = await emailService.send({
						to: appointment.customer.email,
						subject: "Sua consulta começa em 1 hora",
						html: buildReminderEmailHtml({
							customerName: getPatientName(appointment),
							providerName: appointment.healthcareProvider.name,
							scheduledAt: appointment.scheduledAt,
						}),
						text: `${getPatientName(appointment)}, sua consulta com ${appointment.healthcareProvider.name} está marcada para ${formatAppointmentDate(appointment.scheduledAt)}. Falta 1 hora para o atendimento.`,
						idempotencyKey: dedupeKey,
					});

					await prismaNotificationsRepository.createDelivery({
						userId: customerId,
						type: "APPOINTMENT_REMINDER",
						channel: "EMAIL",
						appointmentId: appointment.id,
						dedupeKey,
						status: emailResult.status === "sent" ? "SENT" : "FAILED",
						errorMessage:
							emailResult.status === "failed"
								? emailResult.errorMessage
								: undefined,
						sentAt: emailResult.status === "sent" ? new Date() : undefined,
					});

					if (emailResult.status === "sent") {
						summary.sent += 1;
					} else {
						summary.failed += 1;
					}
				}
			}
		}

		return summary;
	},
};
