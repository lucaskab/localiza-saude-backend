import type { SeedClient } from "./types";

const professionalCouncils = [
	{
		id: "professional-council-crm",
		acronym: "CRM",
		name: "Conselho Regional de Medicina",
		profession: "Medicina",
		allowsPriceDisplay: true,
		priceDisplayNote:
			"CFM permite informar valores de consultas e formas de pagamento, respeitadas as regras de publicidade médica.",
	},
	{
		id: "professional-council-cro",
		acronym: "CRO",
		name: "Conselho Regional de Odontologia",
		profession: "Odontologia",
		allowsPriceDisplay: false,
		priceDisplayNote:
			"Regra conservadora para evitar publicidade de preço em serviços odontológicos.",
	},
	{
		id: "professional-council-crp",
		acronym: "CRP",
		name: "Conselho Regional de Psicologia",
		profession: "Psicologia",
		allowsPriceDisplay: false,
		priceDisplayNote:
			"Evita uso de preço como forma de propaganda em serviços psicológicos.",
	},
	{
		id: "professional-council-crn",
		acronym: "CRN",
		name: "Conselho Regional de Nutricionistas",
		profession: "Nutrição",
		allowsPriceDisplay: false,
		priceDisplayNote:
			"Regra conservadora: evita uso de honorários, promoções ou preços como publicidade.",
	},
	{
		id: "professional-council-crefito",
		acronym: "CREFITO",
		name: "Conselho Regional de Fisioterapia e Terapia Ocupacional",
		profession: "Fisioterapia e Terapia Ocupacional",
		allowsPriceDisplay: false,
		priceDisplayNote:
			"COFFITO orienta não divulgar tabelas de preços fora do consultório ou clínica.",
	},
	{
		id: "professional-council-coren",
		acronym: "COREN",
		name: "Conselho Regional de Enfermagem",
		profession: "Enfermagem",
		allowsPriceDisplay: false,
		priceDisplayNote:
			"Regra conservadora para divulgação pública de preços em serviços de enfermagem.",
	},
	{
		id: "professional-council-crf",
		acronym: "CRF",
		name: "Conselho Regional de Farmácia",
		profession: "Farmácia",
		allowsPriceDisplay: false,
		priceDisplayNote:
			"Regra conservadora para divulgação pública de preços em serviços farmacêuticos.",
	},
	{
		id: "professional-council-crbm",
		acronym: "CRBM",
		name: "Conselho Regional de Biomedicina",
		profession: "Biomedicina",
		allowsPriceDisplay: false,
		priceDisplayNote:
			"Regra conservadora para divulgação pública de preços em serviços biomédicos.",
	},
	{
		id: "professional-council-crefono",
		acronym: "CREFONO",
		name: "Conselho Regional de Fonoaudiologia",
		profession: "Fonoaudiologia",
		allowsPriceDisplay: false,
		priceDisplayNote:
			"Código de Ética da Fonoaudiologia considera infração anunciar preços e descontos.",
	},
	{
		id: "professional-council-cref",
		acronym: "CREF",
		name: "Conselho Regional de Educação Física",
		profession: "Educação Física",
		allowsPriceDisplay: true,
		priceDisplayNote:
			"Permite exibição de preço no marketplace por padrão, sem campanhas enganosas ou abusivas.",
	},
	{
		id: "professional-council-crbio",
		acronym: "CRBio",
		name: "Conselho Regional de Biologia",
		profession: "Biologia",
		allowsPriceDisplay: true,
		priceDisplayNote:
			"Permite exibição de preço no marketplace por padrão, respeitando regras profissionais aplicáveis.",
	},
	{
		id: "professional-council-crmv",
		acronym: "CRMV",
		name: "Conselho Regional de Medicina Veterinária",
		profession: "Medicina Veterinária",
		allowsPriceDisplay: true,
		priceDisplayNote:
			"Permite exibição de preço no marketplace por padrão, respeitando regras profissionais aplicáveis.",
	},
	{
		id: "professional-council-cress",
		acronym: "CRESS",
		name: "Conselho Regional de Serviço Social",
		profession: "Serviço Social",
		allowsPriceDisplay: false,
		priceDisplayNote:
			"Regra conservadora para divulgação pública de preços em serviços sociais ligados à saúde.",
	},
	{
		id: "professional-council-crq",
		acronym: "CRQ",
		name: "Conselho Regional de Química",
		profession: "Química aplicada à saúde",
		allowsPriceDisplay: false,
		priceDisplayNote:
			"Regra conservadora para atividades de saúde vinculadas a registro em conselho de química.",
	},
	{
		id: "professional-council-crtr",
		acronym: "CRTR",
		name: "Conselho Regional de Técnicos em Radiologia",
		profession: "Radiologia",
		allowsPriceDisplay: false,
		priceDisplayNote:
			"Regra conservadora para divulgação pública de preços em serviços de radiologia.",
	},
	{
		id: "professional-council-rms",
		acronym: "RMS",
		name: "Registro do Ministério da Saúde (Programa Mais Médicos)",
		profession: "Medicina",
		allowsPriceDisplay: false,
		priceDisplayNote:
			"Registro especial do Programa Mais Médicos; por padrão, o marketplace não exibe preços públicos.",
	},
] as const;

export async function seedProfessionalCouncils(prisma: SeedClient) {
	console.log("🏛️  Seeding professional councils...");

	for (const council of professionalCouncils) {
		await prisma.professional_council.upsert({
			where: { acronym: council.acronym },
			create: council,
			update: {
				name: council.name,
				profession: council.profession,
				allowsPriceDisplay: council.allowsPriceDisplay,
				priceDisplayNote: council.priceDisplayNote,
				active: true,
			},
		});
	}

	console.log(`✅ Professional councils ready: ${professionalCouncils.length}`);
}
