import type { SeedClient, SeedProcedures, SeedUsers } from "./types";

const scheduleTemplates = {
	lucas: [
		[1, "08:00", "12:00"],
		[2, "14:00", "18:00"],
		[4, "08:00", "12:00"],
		[5, "13:00", "17:00"],
	],
	ana: [
		[1, "08:00", "12:00"],
		[2, "08:00", "12:00"],
		[3, "14:00", "18:00"],
		[4, "08:00", "12:00"],
		[5, "08:00", "12:00"],
	],
	carlos: [
		[1, "09:00", "17:00"],
		[2, "09:00", "17:00"],
		[4, "09:00", "17:00"],
		[5, "09:00", "15:00"],
	],
	marina: [
		[1, "10:00", "18:00"],
		[3, "10:00", "18:00"],
		[5, "10:00", "16:00"],
	],
	rafael: [
		[2, "07:00", "13:00"],
		[3, "07:00", "13:00"],
		[4, "14:00", "20:00"],
		[6, "08:00", "12:00"],
	],
	beatriz: [
		[1, "13:00", "19:00"],
		[3, "13:00", "19:00"],
		[5, "09:00", "15:00"],
	],
	pedro: [
		[2, "08:00", "18:00"],
		[4, "08:00", "18:00"],
		[5, "08:00", "14:00"],
	],
} as const;

const procedureChecklistTemplates: Record<string, string[]> = {
	"Consulta clínica geral": [
		"Leve documentos pessoais e exames recentes, se houver.",
		"Anote sintomas, medicamentos em uso e dúvidas principais.",
	],
	"Retorno clínico": [
		"Leve os exames solicitados na consulta anterior.",
		"Informe qualquer mudança de medicamento ou sintoma.",
	],
	"Check-up preventivo": [
		"Faça jejum somente se houver orientação prévia.",
		"Leve histórico de exames dos últimos 12 meses.",
	],
	"Consulta cardiológica": [
		"Leve exames cardíacos anteriores, como ECG ou ecocardiograma.",
		"Evite cafeína nas 4 horas anteriores se houver avaliação de pressão.",
	],
	"Consulta nutricional inicial": [
		"Registre sua alimentação dos últimos 3 dias.",
		"Leve exames laboratoriais recentes, se tiver.",
	],
	"Sessão de psicoterapia": [
		"Escolha um local reservado e silencioso para atendimento online.",
		"Entre na chamada alguns minutos antes do horário.",
	],
	"Avaliação fisioterapêutica": [
		"Use roupas confortáveis que permitam avaliação de movimento.",
		"Leve laudos, exames de imagem ou encaminhamentos.",
	],
	"Consulta dermatológica": [
		"Evite maquiagem ou produtos fortes na pele no dia da consulta.",
		"Leve lista de produtos e medicamentos em uso.",
	],
	"Avaliação odontológica": [
		"Leve radiografias ou exames odontológicos recentes, se houver.",
		"Informe alergias e medicamentos em uso.",
	],
};

const defaultChecklistItems = [
	"Chegue com 10 minutos de antecedência.",
	"Leve documento com foto e informações de saúde relevantes.",
];

const procedureTemplates = {
	lucas: [
		[
			"Consulta clínica geral",
			"Avaliação clínica e plano de cuidado.",
			19000,
			45,
		],
		["Retorno clínico", "Revisão de exames e acompanhamento.", 12000, 30],
		["Check-up preventivo", "Consulta ampliada para prevenção.", 36000, 75],
	],
	ana: [
		[
			"Consulta cardiológica",
			"Avaliação completa e plano preventivo.",
			22000,
			45,
		],
		["Retorno com exames", "Análise de exames e ajuste de conduta.", 16000, 30],
		["Check-up cardiovascular", "Avaliação preventiva ampliada.", 42000, 75],
	],
	carlos: [
		["Consulta nutricional inicial", "Avaliação e plano alimentar.", 18000, 60],
		["Retorno nutricional", "Acompanhamento e ajustes.", 12000, 30],
		[
			"Avaliação esportiva",
			"Plano para performance e composição corporal.",
			25000,
			75,
		],
	],
	marina: [
		["Sessão de psicoterapia", "Sessão online individual.", 15000, 50],
		[
			"Sessão inicial",
			"Entendimento de demanda e plano terapêutico.",
			18000,
			60,
		],
	],
	rafael: [
		[
			"Avaliação fisioterapêutica",
			"Avaliação funcional e plano de reabilitação.",
			14000,
			45,
		],
		["Sessão de fisioterapia", "Sessão presencial ou domiciliar.", 13000, 50],
		[
			"Reabilitação pós-operatória",
			"Sessão focada em recuperação progressiva.",
			18000,
			60,
		],
	],
	beatriz: [
		["Consulta dermatológica", "Avaliação clínica da pele.", 23000, 40],
		["Retorno dermatológico", "Revisão de tratamento.", 15000, 25],
		[
			"Procedimento estético simples",
			"Procedimento conforme avaliação médica.",
			60000,
			60,
		],
	],
	pedro: [
		[
			"Avaliação odontológica",
			"Exame clínico e plano de tratamento.",
			12000,
			30,
		],
		["Limpeza dental", "Profilaxia e polimento.", 18000, 50],
		[
			"Planejamento digital do sorriso",
			"Avaliação estética e simulação.",
			35000,
			60,
		],
	],
} as const;

export async function seedSchedulesAndProcedures(
	prisma: SeedClient,
	users: SeedUsers,
): Promise<SeedProcedures> {
	console.log("📅 Seeding schedules and procedures...");

	for (const [providerKey, schedules] of Object.entries(scheduleTemplates)) {
		await prisma.healthcare_provider_schedule.createMany({
			data: schedules.map(([dayOfWeek, startTime, endTime]) => ({
				healthcareProviderId: users.providers[providerKey].id,
				dayOfWeek,
				startTime,
				endTime,
			})),
		});
	}

	const procedures: SeedProcedures = {};

	for (const [providerKey, providerProcedures] of Object.entries(
		procedureTemplates,
	)) {
		for (const [index, template] of providerProcedures.entries()) {
			const [name, description, priceInCents, durationInMinutes] = template;
			const key = `${providerKey}${index + 1}`;

			procedures[key] = await prisma.procedure.create({
				data: {
					name,
					description,
					priceInCents,
					durationInMinutes,
					healthcareProviderId: users.providers[providerKey].id,
					checklistItems: {
						create: (procedureChecklistTemplates[name] ?? defaultChecklistItems).map(
							(text, position) => ({
								text,
								position,
							}),
						),
					},
				},
			});
		}
	}

	console.log(
		`✅ Created ${Object.values(scheduleTemplates).flat().length} schedules and ${Object.keys(procedures).length} procedures`,
	);

	return procedures;
}
