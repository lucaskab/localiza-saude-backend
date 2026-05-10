import type { SeedAppointments, SeedClient, SeedUsers } from "./types";

export async function seedConversations(
	prisma: SeedClient,
	users: SeedUsers,
	appointments: SeedAppointments,
) {
	console.log("💬 Seeding conversations and private file messages...");

	const cardioConversation = await prisma.conversation.create({
		data: {
			customerId: users.customers.lucas.id,
			healthcareProviderId: users.providers.ana.id,
			lastMessageAt: new Date("2026-05-10T16:10:00.000Z"),
		},
	});

	const nutritionConversation = await prisma.conversation.create({
		data: {
			customerId: users.customers.lucas.id,
			healthcareProviderId: users.providers.carlos.id,
			lastMessageAt: new Date("2026-05-10T15:30:00.000Z"),
		},
	});

	const lucasProviderConversation = await prisma.conversation.create({
		data: {
			customerId: users.customers.juliana.id,
			healthcareProviderId: users.providers.lucas.id,
			lastMessageAt: new Date("2026-05-10T18:15:00.000Z"),
		},
	});

	const physioConversation = await prisma.conversation.create({
		data: {
			customerId: users.customers.juliana.id,
			healthcareProviderId: users.providers.rafael.id,
			lastMessageAt: new Date("2026-05-10T17:20:00.000Z"),
		},
	});

	await prisma.conversation_message.createMany({
		data: [
			{
				conversationId: cardioConversation.id,
				senderId: users.customers.lucas.id,
				senderType: "CUSTOMER",
				messageType: "TEXT",
				content:
					"Olá, Dra. Ana. Já enviei meus exames para a consulta de terça.",
				relatedAppointmentId: appointments.lucasCardio.id,
				createdAt: new Date("2026-05-10T15:45:00.000Z"),
			},
			{
				conversationId: cardioConversation.id,
				senderId: users.customers.lucas.id,
				senderType: "CUSTOMER",
				messageType: "FILE",
				content: "Arquivo do exame anexado.",
				fileKey: "chat-files/seed/lucas/exame-cardiologico.pdf",
				fileName: "exame-cardiologico.pdf",
				fileSize: 734_003,
				fileMimeType: "application/pdf",
				relatedAppointmentId: appointments.lucasCardio.id,
				createdAt: new Date("2026-05-10T15:48:00.000Z"),
			},
			{
				conversationId: cardioConversation.id,
				senderId: users.providers.ana.id,
				senderType: "HEALTHCARE_PROVIDER",
				messageType: "TEXT",
				content:
					"Recebi por aqui. Vou revisar antes da teleconsulta e conversamos sobre os resultados.",
				relatedAppointmentId: appointments.lucasCardio.id,
				createdAt: new Date("2026-05-10T16:10:00.000Z"),
			},
			{
				conversationId: nutritionConversation.id,
				senderId: users.providers.carlos.id,
				senderType: "HEALTHCARE_PROVIDER",
				messageType: "TEXT",
				content:
					"Lucas, para a primeira consulta traga ou envie seus exames recentes e rotina alimentar.",
				relatedAppointmentId: appointments.lucasNutrition.id,
				createdAt: new Date("2026-05-10T15:30:00.000Z"),
			},
			{
				conversationId: lucasProviderConversation.id,
				senderId: users.customers.juliana.id,
				senderType: "CUSTOMER",
				messageType: "TEXT",
				content:
					"Dr. Lucas, confirmei o horário da teleconsulta e já anexei meus exames anteriores.",
				relatedAppointmentId: appointments.lucasProviderOnline.id,
				createdAt: new Date("2026-05-10T18:00:00.000Z"),
			},
			{
				conversationId: lucasProviderConversation.id,
				senderId: users.providers.lucas.id,
				senderType: "HEALTHCARE_PROVIDER",
				messageType: "TEXT",
				content: "Perfeito, Juliana. Vou revisar os exames antes da chamada.",
				relatedAppointmentId: appointments.lucasProviderOnline.id,
				createdAt: new Date("2026-05-10T18:15:00.000Z"),
			},
			{
				conversationId: physioConversation.id,
				senderId: users.customers.juliana.id,
				senderType: "CUSTOMER",
				messageType: "TEXT",
				content:
					"Oi, Dr. Rafael. Preciso ajustar o endereço do atendimento domiciliar.",
				relatedAppointmentId: appointments.noShowPhysio.id,
				createdAt: new Date("2026-05-10T17:00:00.000Z"),
			},
			{
				conversationId: physioConversation.id,
				senderId: users.providers.rafael.id,
				senderType: "HEALTHCARE_PROVIDER",
				messageType: "FILE",
				content: "Enviei orientações pré-atendimento.",
				fileKey: "chat-files/seed/rafael/orientacoes-fisioterapia.pdf",
				fileName: "orientacoes-fisioterapia.pdf",
				fileSize: 188_120,
				fileMimeType: "application/pdf",
				relatedAppointmentId: appointments.noShowPhysio.id,
				createdAt: new Date("2026-05-10T17:20:00.000Z"),
			},
		],
	});

	console.log(
		"✅ Created conversations with text and private file-key messages",
	);
}
