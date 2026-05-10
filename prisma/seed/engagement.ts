import type { SeedAppointments, SeedClient, SeedUsers } from "./types";

export async function seedEngagement(
	prisma: SeedClient,
	users: SeedUsers,
	appointments: SeedAppointments,
) {
	console.log("⭐ Seeding favorites, ratings, notifications and support...");

	await prisma.customer_favorite_provider.createMany({
		data: [
			{
				customerId: users.customers.lucas.id,
				healthcareProviderId: users.providers.ana.id,
			},
			{
				customerId: users.customers.lucas.id,
				healthcareProviderId: users.providers.carlos.id,
			},
			{
				customerId: users.customers.juliana.id,
				healthcareProviderId: users.providers.beatriz.id,
			},
			{
				customerId: users.customers.juliana.id,
				healthcareProviderId: users.providers.pedro.id,
			},
			{
				customerId: users.customers.lucas.id,
				healthcareProviderId: users.providers.lucas.id,
			},
			{
				customerId: users.customers.lucas.id,
				healthcareProviderId: users.providers.rafael.id,
			},
		],
	});

	await prisma.rating.createMany({
		data: [
			{
				customerId: users.customers.lucas.id,
				healthcareProviderId: users.providers.marina.id,
				rating: 5,
				comment:
					"Atendimento online muito acolhedor e objetivo. Recomendo bastante.",
			},
			{
				customerId: users.customers.juliana.id,
				healthcareProviderId: users.providers.pedro.id,
				rating: 5,
				comment:
					"Consulta excelente, explicou todas as etapas antes do procedimento.",
			},
			{
				customerId: users.customers.lucas.id,
				healthcareProviderId: users.providers.ana.id,
				rating: 4,
				comment: "Muito atenciosa e pontual na consulta online.",
			},
			{
				customerId: users.customers.juliana.id,
				healthcareProviderId: users.providers.beatriz.id,
				rating: 4,
				comment: "Clínica organizada e atendimento objetivo.",
			},
			{
				customerId: users.customers.juliana.id,
				healthcareProviderId: users.providers.lucas.id,
				rating: 5,
				comment: "Consulta muito clara, com plano preventivo fácil de seguir.",
			},
			{
				customerId: users.customers.lucas.id,
				healthcareProviderId: users.providers.rafael.id,
				rating: 3,
				comment: "Bom atendimento, mas o deslocamento atrasou um pouco.",
			},
		],
	});

	const usersForPreferences = [
		users.customers.lucas,
		users.customers.juliana,
		users.providers.lucas,
		users.admin,
		users.staff.recepcaoPaulista,
		users.staff.agendaPinheiros,
		users.providers.ana,
		users.providers.carlos,
		users.providers.marina,
		users.providers.rafael,
		users.providers.beatriz,
		users.providers.pedro,
	];

	await prisma.notification_preference.createMany({
		data: usersForPreferences.flatMap((user) =>
			[
				"APPOINTMENT_REMINDER",
				"APPOINTMENT_STATUS_UPDATE",
				"NEW_APPOINTMENT_REQUEST",
			].map((type) => ({
				userId: user.id,
				type: type as
					| "APPOINTMENT_REMINDER"
					| "APPOINTMENT_STATUS_UPDATE"
					| "NEW_APPOINTMENT_REQUEST",
				enabled: true,
			})),
		),
	});

	await prisma.push_token.createMany({
		data: [
			{
				userId: users.customers.lucas.id,
				token: "ExponentPushToken[seed-customer-lucas]",
				platform: "IOS",
				deviceId: "seed-ios-lucas",
			},
			{
				userId: users.providers.lucas.id,
				token: "ExponentPushToken[seed-provider-lucas]",
				platform: "IOS",
				deviceId: "seed-ios-provider-lucas",
			},
			{
				userId: users.providers.ana.id,
				token: "ExponentPushToken[seed-provider-ana]",
				platform: "ANDROID",
				deviceId: "seed-android-ana",
			},
			{
				userId: users.staff.recepcaoPaulista.id,
				token: "ExponentPushToken[seed-staff-web]",
				platform: "WEB",
				deviceId: "seed-web-staff",
			},
			{
				userId: users.providers.marina.id,
				token: "ExponentPushToken[seed-provider-unknown]",
				platform: "UNKNOWN",
				deviceId: "seed-unknown-marina",
				isActive: false,
			},
		],
	});

	await prisma.notification_delivery.createMany({
		data: [
			{
				userId: users.customers.lucas.id,
				appointmentId: appointments.lucasCardio.id,
				type: "APPOINTMENT_REMINDER",
				status: "PENDING",
			},
			{
				userId: users.providers.lucas.id,
				appointmentId: appointments.lucasProviderOnline.id,
				type: "NEW_APPOINTMENT_REQUEST",
				status: "SENT",
				expoTicketId: "seed-ticket-provider-lucas",
				sentAt: new Date("2026-05-10T18:05:00.000Z"),
			},
			{
				userId: users.providers.ana.id,
				appointmentId: appointments.lucasCardio.id,
				type: "NEW_APPOINTMENT_REQUEST",
				status: "SENT",
				expoTicketId: "seed-ticket-ana",
				sentAt: new Date("2026-05-10T10:05:00.000Z"),
			},
			{
				userId: users.customers.juliana.id,
				appointmentId: appointments.julianaDermato.id,
				type: "APPOINTMENT_STATUS_UPDATE",
				status: "FAILED",
				errorMessage: "Seed failure sample for notification history.",
			},
			{
				userId: users.staff.recepcaoPaulista.id,
				appointmentId: appointments.lucasNutrition.id,
				type: "APPOINTMENT_STATUS_UPDATE",
				status: "SKIPPED",
				errorMessage: "User disabled this notification type.",
			},
		],
	});

	await prisma.support_request.createMany({
		data: [
			{
				userId: users.customers.lucas.id,
				type: "FEEDBACK",
				subject: "Experiência com busca por localização",
				message:
					"O filtro perto de mim ajudou bastante a encontrar profissionais próximos.",
				contactEmail: users.customers.lucas.email,
				appVersion: "1.0.0-seed",
				platform: "web",
				environment: "development",
				status: "RESOLVED",
			},
			{
				userId: users.customers.juliana.id,
				type: "PROBLEM_REPORT",
				subject: "Dúvida sobre reagendamento",
				message:
					"Gostaria de entender quando o provider precisa aprovar uma mudança de horário.",
				contactEmail: users.customers.juliana.email,
				appVersion: "1.0.0-seed",
				platform: "ios",
				environment: "development",
				status: "IN_REVIEW",
			},
			{
				userId: users.customers.lucas.id,
				type: "DATA_DELETION",
				subject: "Exemplo LGPD",
				message: "Solicitação fictícia para validar a tela de configurações.",
				contactEmail: users.customers.lucas.email,
				appVersion: "1.0.0-seed",
				platform: "android",
				environment: "development",
				status: "OPEN",
			},
			{
				userId: users.customers.juliana.id,
				type: "ACCOUNT_DELETION",
				subject: "Solicitação fictícia de exclusão de conta",
				message: "Registro para validar fluxo de privacidade e compliance.",
				contactEmail: users.customers.juliana.email,
				appVersion: "1.0.0-seed",
				platform: "web",
				environment: "development",
				status: "CLOSED",
			},
			{
				userId: users.providers.ana.id,
				type: "SUPPORT_CONTACT",
				subject: "Dúvida sobre equipe da clínica",
				message: "Como ajusto permissões de staff para gerenciar agendamentos?",
				contactEmail: users.providers.ana.email,
				appVersion: "1.0.0-seed",
				platform: "web",
				environment: "development",
				status: "OPEN",
			},
		],
	});

	console.log(
		"✅ Created favorites, ratings, notifications and support requests",
	);
}
