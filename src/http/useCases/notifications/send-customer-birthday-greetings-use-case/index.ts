import { prismaNotificationsRepository } from "@/http/repositories/notifications/notifications-repository-implementation";
import { emailService } from "@/http/services/email.service";
import { buildBirthdayGreetingMessage } from "./template";

const isSameUtcMonthAndDay = (source: Date, target: Date) =>
	source.getUTCMonth() === target.getUTCMonth() &&
	source.getUTCDate() === target.getUTCDate();

const buildBirthdayDedupeKey = (providerId: string, year: number) =>
	`birthday:${providerId}:${year}`;

export const sendCustomerBirthdayGreetingsUseCase = {
	async execute(now = new Date()) {
		const appointments =
			await prismaNotificationsRepository.findBirthdayGreetingCandidates();

		const summary = {
			processed: appointments.length,
			sent: 0,
			skipped: 0,
			failed: 0,
		};

		for (const appointment of appointments) {
			const customer = appointment.customer;
			const provider = appointment.healthcareProvider;
			const birthDate = customer?.dateOfBirth;

			if (!customer || !customer.email || !birthDate) {
				summary.skipped += 1;
				continue;
			}

			if (!isSameUtcMonthAndDay(birthDate, now)) {
				summary.skipped += 1;
				continue;
			}

			const dedupeKey = buildBirthdayDedupeKey(
				provider.id,
				now.getUTCFullYear(),
			);
			const existingDelivery = await prismaNotificationsRepository.findDelivery(
				customer.id,
				"CUSTOMER_BIRTHDAY_GREETING",
				"EMAIL",
				dedupeKey,
			);

			if (existingDelivery) {
				summary.skipped += 1;
				continue;
			}

			const message = buildBirthdayGreetingMessage({
				customerName: customer.firstName ?? customer.name,
				customerFirstName: customer.firstName ?? customer.name,
				providerName: provider.displayName ?? provider.name,
				subjectTemplate: provider.birthdayGreetingEmailSubjectTemplate,
				htmlTemplate: provider.birthdayGreetingEmailHtmlTemplate,
			});

			const emailResult = await emailService.send({
				to: customer.email,
				subject: message.subject,
				html: message.html,
				text: message.text,
				idempotencyKey: dedupeKey,
			});

			await prismaNotificationsRepository.createDelivery({
				userId: customer.id,
				type: "CUSTOMER_BIRTHDAY_GREETING",
				channel: "EMAIL",
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

		return summary;
	},
};
