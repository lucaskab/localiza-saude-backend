import { env } from "@/env";
import { prismaAppointmentWaitlistRepository } from "@/http/repositories/appointment-waitlist/appointment-waitlist-repository-implementation";
import type { AppointmentWaitlistEntryWithRelations } from "@/http/repositories/appointment-waitlist/appointment-waitlist-repository-contract";
import type { AppointmentWithRelations } from "@/http/repositories/appointments/appointments-repository-contract";
import { emailService } from "@/http/services/email.service";
import { pushNotificationsService } from "@/http/services/push-notifications.service";

const formatAppointmentDate = (date: Date) =>
	new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "America/Sao_Paulo",
	}).format(date);

function getBookingUrl(entry: AppointmentWaitlistEntryWithRelations) {
	const procedureIds = entry.procedures
		.map((waitlistProcedure) => waitlistProcedure.procedureId)
		.join(",");

	return env.WEB_APP_URL
		? `${env.WEB_APP_URL}/doctors/${entry.healthcareProviderId}/booking?procedures=${procedureIds}`
		: null;
}

function getProcedureDuration(entry: AppointmentWaitlistEntryWithRelations) {
	return entry.procedures.reduce(
		(total, waitlistProcedure) =>
			total + waitlistProcedure.procedure.durationInMinutes,
		0,
	);
}

function buildEmailHtml({
	customerName,
	providerName,
	availableAt,
	bookingUrl,
}: {
	customerName: string;
	providerName: string;
	availableAt: string;
	bookingUrl: string | null;
}) {
	return `
		<div style="font-family: Arial, sans-serif; color: #142332; line-height: 1.5;">
			<h1 style="font-size: 22px;">O horário que você queria ficou disponível</h1>
			<p>Olá, ${customerName}.</p>
			<p>O horário com ${providerName} em <strong>${availableAt}</strong> acabou de ficar livre.</p>
			<p>Ele foi avisado para todos que estavam aguardando esse mesmo horário. Quem agendar primeiro fica com a vaga.</p>
			${
				bookingUrl
					? `<p><a href="${bookingUrl}" style="display: inline-block; padding: 12px 18px; background: #147f76; color: #ffffff; border-radius: 10px; text-decoration: none;">Agendar agora</a></p>`
					: ""
			}
		</div>
	`;
}

export const notifyWaitlistSlotAvailableUseCase = {
	async execute(cancelledAppointment: AppointmentWithRelations) {
		if (cancelledAppointment.scheduledAt <= new Date()) {
			return;
		}

		const waitlistEntries =
			await prismaAppointmentWaitlistRepository.findMatchingForCancelledAppointment(
				cancelledAppointment,
			);

		for (const entry of waitlistEntries) {
			if (getProcedureDuration(entry) > cancelledAppointment.totalDurationMinutes) {
				continue;
			}

			const availableAt = formatAppointmentDate(cancelledAppointment.scheduledAt);
			const customerName = entry.customer.name || "Paciente";
			const providerName =
				cancelledAppointment.healthcareProvider?.name ||
				entry.healthcareProvider.name ||
				"profissional";
			const bookingUrl = getBookingUrl(entry);
			const title = "Horario disponivel";
			const body = `O horario com ${providerName} em ${availableAt} ficou livre. Quem agendar primeiro fica com a vaga.`;

			await pushNotificationsService
				.sendToUser({
					userId: entry.customerId,
					type: "WAITLIST_SLOT_AVAILABLE",
					title,
					body,
					data: {
						screen: "booking",
						healthcareProviderId: entry.healthcareProviderId,
						scheduledAt: entry.desiredScheduledAt.toISOString(),
						procedureIds: entry.procedures
							.map((waitlistProcedure) => waitlistProcedure.procedureId)
							.join(","),
					},
				})
				.catch((error) => {
					console.error("Failed to send waitlist push notification:", error);
				});

			await emailService
				.send({
					to: entry.customer.email,
					subject: "O horário que você queria ficou disponível",
					html: buildEmailHtml({
						customerName,
						providerName,
						availableAt,
						bookingUrl,
					}),
					text: `Olá, ${customerName}. O horário com ${providerName} em ${availableAt} ficou livre. Quem agendar primeiro fica com a vaga.`,
					idempotencyKey: `waitlist-${entry.id}-${cancelledAppointment.id}`,
				})
				.catch((error) => {
					console.error("Failed to send waitlist email notification:", error);
				});

			await prismaAppointmentWaitlistRepository.markNotified(entry.id);
		}
	},
};
