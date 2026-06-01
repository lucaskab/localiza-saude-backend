import type { SeedClient, SeedUsers } from "./types";

const providerFaqs = {
	lucas: [
		{
			question: "Você atende online e presencial?",
			answer:
				"Sim. Minha agenda tem horários presenciais, online e alguns encaixes para atendimento domiciliar.",
		},
		{
			question: "Posso levar exames anteriores?",
			answer:
				"Sim. Exames anteriores ajudam bastante na avaliação e no acompanhamento preventivo.",
		},
	],
	ana: [
		{
			question: "Você atende teleconsulta?",
			answer:
				"Sim. A teleconsulta é indicada para retorno, avaliação de exames e acompanhamento preventivo.",
		},
		{
			question: "Atende a domicílio?",
			answer:
				"Atendo a domicílio em regiões centrais de Berlin, conforme disponibilidade da agenda.",
		},
	],
	carlos: [
		{
			question: "Você monta plano alimentar?",
			answer:
				"Sim. O plano é criado após avaliação clínica, rotina e preferências alimentares.",
		},
	],
	marina: [
		{
			question: "As sessões são somente online?",
			answer:
				"Sim. Hoje minha agenda na Localiza Saúde está configurada para atendimento online.",
		},
	],
	rafael: [
		{
			question: "O atendimento domiciliar inclui equipamentos?",
			answer:
				"Levo equipamentos leves. Casos que exigem estrutura maior são direcionados ao consultório.",
		},
	],
	beatriz: [
		{
			question: "Procedimentos estéticos são feitos na primeira consulta?",
			answer:
				"Depende da avaliação. Quando indicado e seguro, alguns procedimentos podem ser realizados no mesmo dia.",
		},
	],
	pedro: [
		{
			question: "Você trabalha com planejamento digital?",
			answer:
				"Sim. Faço simulação e planejamento digital antes de procedimentos estéticos.",
		},
	],
};

export async function seedProviderFaqs(prisma: SeedClient, users: SeedUsers) {
	console.log("❓ Seeding provider FAQs...");

	for (const [providerKey, faqs] of Object.entries(providerFaqs)) {
		await prisma.healthcare_provider_faq.createMany({
			data: faqs.map((faq, index) => ({
				healthcareProviderId: users.providers[providerKey].id,
				question: faq.question,
				answer: faq.answer,
				position: index,
			})),
		});
	}

	console.log("✅ Created provider FAQs");
}

export async function seedProviderVerification(
	prisma: SeedClient,
	users: SeedUsers,
) {
	console.log("🛡️  Seeding provider verification history...");

	await prisma.provider_verification_review.createMany({
		data: [
			{
				healthcareProviderId: users.providers.lucas.id,
				reviewerUserId: users.admin.id,
				status: "APPROVED",
				internalNotes:
					"Conta real de teste do provider validada para ambiente de desenvolvimento.",
				documentKey: users.providers.lucas.licenseDocumentKey,
				documentSha256: users.providers.lucas.licenseDocumentSha256,
				createdAt: new Date("2026-05-02T12:05:00.000Z"),
			},
			{
				healthcareProviderId: users.providers.ana.id,
				reviewerUserId: users.admin.id,
				status: "APPROVED",
				internalNotes: "CRM validado manualmente no portal do conselho.",
				documentKey: users.providers.ana.licenseDocumentKey,
				documentSha256: users.providers.ana.licenseDocumentSha256,
				createdAt: new Date("2026-05-01T09:05:00.000Z"),
			},
			{
				healthcareProviderId: users.providers.beatriz.id,
				reviewerUserId: users.admin.id,
				status: "APPROVED",
				internalNotes: "Documento e dados cadastrais consistentes.",
				documentKey: users.providers.beatriz.licenseDocumentKey,
				documentSha256: users.providers.beatriz.licenseDocumentSha256,
				createdAt: new Date("2026-05-02T13:10:00.000Z"),
			},
			{
				healthcareProviderId: users.providers.rafael.id,
				reviewerUserId: users.admin.id,
				status: "REJECTED",
				reason: users.providers.rafael.verificationRejectionReason,
				internalNotes: "Imagem desfocada e sem leitura completa do número.",
				documentKey: users.providers.rafael.licenseDocumentKey,
				documentSha256: users.providers.rafael.licenseDocumentSha256,
				createdAt: new Date("2026-05-03T14:00:00.000Z"),
			},
		],
	});

	await prisma.provider_verification_document_access_log.createMany({
		data: [
			{
				healthcareProviderId: users.providers.lucas.id,
				adminUserId: users.admin.id,
				documentKey: users.providers.lucas.licenseDocumentKey ?? "",
				ipAddress: "127.0.0.1",
				userAgent: "seed/admin-panel",
			},
			{
				healthcareProviderId: users.providers.ana.id,
				adminUserId: users.admin.id,
				documentKey: users.providers.ana.licenseDocumentKey ?? "",
				ipAddress: "127.0.0.1",
				userAgent: "seed/admin-panel",
			},
			{
				healthcareProviderId: users.providers.rafael.id,
				adminUserId: users.admin.id,
				documentKey: users.providers.rafael.licenseDocumentKey ?? "",
				ipAddress: "127.0.0.1",
				userAgent: "seed/admin-panel",
			},
		],
	});

	console.log("✅ Created provider verification reviews and access logs");
}
