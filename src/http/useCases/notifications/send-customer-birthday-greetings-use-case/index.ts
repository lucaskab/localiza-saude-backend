import { prismaNotificationsRepository } from "@/http/repositories/notifications/notifications-repository-implementation";
import { emailService } from "@/http/services/email.service";

const isSameUtcMonthAndDay = (source: Date, target: Date) =>
	source.getUTCMonth() === target.getUTCMonth() &&
	source.getUTCDate() === target.getUTCDate();

const buildBirthdayDedupeKey = (providerId: string, year: number) =>
	`birthday:${providerId}:${year}`;

const buildBirthdayEmailHtml = ({
	customerName,
	providerName,
}: {
	customerName: string;
	providerName: string;
}) => `
	<div style="background:linear-gradient(180deg,#f6fbfb 0%,#eef8f7 100%);padding:36px 16px;font-family:Inter,Arial,sans-serif;color:#17313b;">
		<div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dceceb;border-radius:28px;overflow:hidden;box-shadow:0 24px 60px rgba(22,68,73,.10);">
			<div style="padding:36px 32px;background:linear-gradient(135deg,#1b847e 0%,#14635e 100%);color:#ffffff;text-align:center;">
				<div style="font-size:14px;letter-spacing:.12em;text-transform:uppercase;opacity:.85;">Localiza Saúde</div>
				<h1 style="margin:16px 0 8px;font-size:34px;line-height:1.1;">Feliz aniversário!</h1>
				<p style="margin:0;font-size:16px;line-height:1.7;opacity:.92;">Que seu novo ciclo venha com mais saúde, leveza e bons encontros.</p>
			</div>
			<div style="padding:36px 32px;">
				<p style="margin:0 0 16px;font-size:17px;line-height:1.75;">Olá, <strong>${customerName}</strong>.</p>
				<p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#49606b;">
					Hoje é um dia especial, e <strong>${providerName}</strong> quis passar aqui para desejar um aniversário bonito, sereno e cheio de motivos para sorrir.
				</p>
				<div style="margin:28px 0;padding:22px 24px;border-radius:22px;background:#f4fbfa;border:1px solid #d8ece8;">
					<p style="margin:0;font-size:16px;line-height:1.85;color:#17313b;">
						Que este novo ano da sua vida seja acompanhado de bem-estar, carinho nas relações e muito cuidado com você.
					</p>
				</div>
				<p style="margin:0;font-size:15px;line-height:1.8;color:#6a7d86;">
					Com carinho,<br />
					<strong>${providerName}</strong>
				</p>
			</div>
		</div>
	</div>
`;

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

			const emailResult = await emailService.send({
				to: customer.email,
				subject: `Feliz aniversário, ${customer.firstName ?? customer.name}!`,
				html: buildBirthdayEmailHtml({
					customerName: customer.firstName ?? customer.name,
					providerName: provider.displayName ?? provider.name,
				}),
				text: `Olá, ${customer.firstName ?? customer.name}. ${provider.displayName ?? provider.name} deseja um feliz aniversário, com muita saúde, leveza e um lindo novo ciclo.`,
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
