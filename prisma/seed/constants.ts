import type { ClinicPermission } from "../generated/prisma/client";

export const REAL_USERS = {
	customerLucas: {
		id: "cmnuu7gqu0001r1sc039r0a70",
		email: "lucaslfurinide@gmail.com",
		name: "Lucas Furini",
		firstName: "Lucas",
		lastName: "Furini",
		phone: "+5511999991001",
	},
	providerLucas: {
		id: "cmnuu7to60006r1scsref3kpv",
		email: "lucaslfurini@gmail.com",
		name: "Lucas Lopes Furini",
		firstName: "Lucas",
		lastName: "Furini",
		phone: "+5511999991002",
	},
	admin: {
		id: "cmovfbjl900012cscacst8y3s",
		email: "localiza.saude.admin@gmail.com",
		name: "Localiza Saúde Admin",
		firstName: "Localiza",
		lastName: "Admin",
		phone: "+5511999991003",
	},
} as const;

export const SEED_PROVIDER_EMAILS = [
	"ana.souza.provider@localiza.seed",
	"carlos.lima.provider@localiza.seed",
	"marina.alves.provider@localiza.seed",
	"rafael.mendes.provider@localiza.seed",
	"beatriz.nunes.provider@localiza.seed",
	"pedro.rocha.provider@localiza.seed",
] as const;

export const SEED_CLINIC_EMAILS = [
	"lucas.furini.clinica@localizasaude.seed",
	"paulista@localizasaude.seed",
	"pinheiros@localizasaude.seed",
	"copacabana@localizasaude.seed",
	"sorriso@localizasaude.seed",
] as const;

export const SEED_CUSTOMERS = {
	juliana: {
		id: "seed_customer_juliana_rodrigues",
		email: "juliana.rodrigues.customer@localiza.seed",
		name: "Juliana Rodrigues",
		firstName: "Juliana",
		lastName: "Rodrigues",
		phone: "+493012340101",
	},
} as const;

export const SEED_STAFF = {
	recepcaoPaulista: {
		id: "seed_staff_mitte_reception",
		email: "recepcao.paulista@localiza.seed",
		name: "Camila Mitte Reception",
		firstName: "Camila",
		lastName: "Reception",
		phone: "+493012340201",
	},
	agendaPinheiros: {
		id: "seed_staff_kreuzberg_schedule",
		email: "agenda.pinheiros@localiza.seed",
		name: "Thiago Kreuzberg Schedule",
		firstName: "Thiago",
		lastName: "Schedule",
		phone: "+493012340202",
	},
} as const;

export const SEED_FAKE_USER_EMAILS = [
	...Object.values(SEED_CUSTOMERS).map((customer) => customer.email),
	...SEED_PROVIDER_EMAILS,
	...Object.values(SEED_STAFF).map((staff) => staff.email),
];

export const STAFF_PERMISSIONS: ClinicPermission[] = [
	"MANAGE_APPOINTMENTS",
	"VIEW_PATIENTS",
	"MANAGE_PROVIDER_SCHEDULE",
];

export const PROVIDERS = {
	ana: {
		id: "seed_provider_ana_souza",
		email: SEED_PROVIDER_EMAILS[0],
		name: "Dra. Ana Souza",
		firstName: "Ana",
		lastName: "Souza",
		phone: "+493012340301",
		image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
		displayName: "Dra. Ana Souza",
		document: "123.456.789-10",
		birthDate: new Date("1982-04-18T00:00:00.000Z"),
		gender: "Feminino",
		languages: ["Português", "Inglês", "Alemão"],
		specialty: "Cardiologia preventiva",
		professionalCategory: "Médica",
		professionalId: "123456",
		professionalCouncilId: "professional-council-crm",
		licenseState: "BE",
		licenseDocumentKey:
			"provider-verification/seed_provider_ana_souza/crm-be-123456.pdf",
		licenseDocumentFileName: "crm-be-123456.pdf",
		licenseDocumentMimeType: "application/pdf",
		licenseDocumentSize: 412_880,
		licenseDocumentSha256:
			"3e1f5fca4b5b3e90b2dcf2d4dcfdc6f0f1a2a3c4f5d6e7a8b9c0d1e2f3a4b5c6",
		verificationStatus: "VERIFIED",
		verifiedAt: new Date("2026-05-01T09:00:00.000Z"),
		bio: "Cardiologista com foco em prevenção, check-ups e acompanhamento longitudinal em Berlin.",
		approach:
			"Atendimento cuidadoso, baseado em escuta ativa e planos simples de acompanhar no dia a dia.",
		education:
			"Medicina pela USP, residência em Cardiologia no InCor e atuação recente com pacientes internacionais em Berlin.",
		certifications:
			"Sociedade Brasileira de Cardiologia, ACLS e medicina preventiva.",
		yearsOfExperience: 14,
		targetAudiences: ["Adultos", "Idosos", "Profissionais expatriados"],
		serviceModalities: ["IN_PERSON", "ONLINE", "HOME_CARE"],
		homeCareRadiusKm: 12,
		acceptedInsurancePlanNames: [
			"Techniker Krankenkasse",
			"AOK",
			"BARMER",
		],
		paymentMethods: ["Pix", "Cartão de crédito", "Cartão de débito"],
		cancellationPolicy:
			"Cancelamentos sem custo até 24 horas antes do horário agendado.",
		clinicPhotos: [
			"provider-clinic-photos/seed_provider_ana_souza/reception.jpg",
			"provider-clinic-photos/seed_provider_ana_souza/office.jpg",
		],
	},
	carlos: {
		id: "seed_provider_carlos_lima",
		email: SEED_PROVIDER_EMAILS[1],
		name: "Dr. Carlos Lima",
		firstName: "Carlos",
		lastName: "Lima",
		phone: "+493012340302",
		image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
		displayName: "Dr. Carlos Lima",
		document: "222.333.444-55",
		birthDate: new Date("1979-09-03T00:00:00.000Z"),
		gender: "Masculino",
		languages: ["Português", "Inglês"],
		specialty: "Nutrição clínica e esportiva",
		professionalCategory: "Nutricionista",
		professionalId: "24567",
		professionalCouncilId: "professional-council-crn",
		licenseState: "BE",
		licenseDocumentKey:
			"provider-verification/seed_provider_carlos_lima/crn-be-24567.pdf",
		licenseDocumentFileName: "crn-be-24567.pdf",
		licenseDocumentMimeType: "application/pdf",
		licenseDocumentSize: 388_112,
		licenseDocumentSha256:
			"6d1e8e2bb5a03a0ce5a9f9b92375f6e7d9d9e7d3f1c2b4a596877e3c2c1b0a99",
		verificationStatus: "VERIFIED",
		verifiedAt: new Date("2026-05-01T11:00:00.000Z"),
		bio: "Nutricionista especializado em performance, rotina urbana e alimentação prática para quem vive em Berlin.",
		approach:
			"Planos alimentares realistas, sem terrorismo nutricional e com acompanhamento de metas.",
		education:
			"Nutrição pela UNIFESP, pós-graduação em nutrição esportiva e consultoria para brasileiros no exterior.",
		certifications:
			"Antropometria ISAK nível 1 e atualização em comportamento alimentar.",
		yearsOfExperience: 11,
		targetAudiences: ["Adultos", "Atletas", "Gestantes"],
		serviceModalities: ["IN_PERSON", "ONLINE"],
		homeCareRadiusKm: null,
		acceptedInsurancePlanNames: ["Privat", "Selbstzahler"],
		paymentMethods: ["Pix", "Cartão de crédito"],
		cancellationPolicy:
			"Reagendamentos podem ser solicitados até 12 horas antes da consulta.",
		clinicPhotos: ["provider-clinic-photos/seed_provider_carlos_lima/room.jpg"],
	},
	marina: {
		id: "seed_provider_marina_alves",
		email: SEED_PROVIDER_EMAILS[2],
		name: "Dra. Marina Alves",
		firstName: "Marina",
		lastName: "Alves",
		phone: "+493012340303",
		image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
		displayName: "Dra. Marina Alves",
		document: "333.444.555-66",
		birthDate: new Date("1987-01-28T00:00:00.000Z"),
		gender: "Feminino",
		languages: ["Português", "Inglês"],
		specialty: "Psicologia clínica",
		professionalCategory: "Psicóloga",
		professionalId: "99887",
		professionalCouncilId: "professional-council-crp",
		licenseState: "BE",
		licenseDocumentKey:
			"provider-verification/seed_provider_marina_alves/crp-be-99887.pdf",
		licenseDocumentFileName: "crp-be-99887.pdf",
		licenseDocumentMimeType: "application/pdf",
		licenseDocumentSize: 301_024,
		licenseDocumentSha256:
			"f2c7c5a669de8fd9a82d40f3a2d2334f6d3dbd54bd47a819981e92fb13d5b916",
		verificationStatus: "PENDING",
		verifiedAt: null,
		bio: "Psicóloga clínica com foco em ansiedade, estresse e adaptação de brasileiros vivendo no exterior.",
		approach:
			"Terapia baseada em evidências, com metas combinadas de forma colaborativa.",
		education:
			"Psicologia pela PUC-SP e formação em Terapia Cognitivo-Comportamental.",
		certifications:
			"TCC para ansiedade, mindfulness clínico e manejo de burnout.",
		yearsOfExperience: 8,
		targetAudiences: [
			"Adultos",
			"Jovens adultos",
			"Profissionais em transição",
		],
		serviceModalities: ["ONLINE"],
		homeCareRadiusKm: null,
		acceptedInsurancePlanNames: ["Selbstzahler"],
		paymentMethods: ["Pix"],
		cancellationPolicy:
			"Sessões online podem ser remarcadas até 24 horas antes do horário.",
		clinicPhotos: [],
	},
	rafael: {
		id: "seed_provider_rafael_mendes",
		email: SEED_PROVIDER_EMAILS[3],
		name: "Dr. Rafael Mendes",
		firstName: "Rafael",
		lastName: "Mendes",
		phone: "+493012340304",
		image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400",
		displayName: "Dr. Rafael Mendes",
		document: "444.555.666-77",
		birthDate: new Date("1984-07-10T00:00:00.000Z"),
		gender: "Masculino",
		languages: ["Português", "Espanhol", "Inglês"],
		specialty: "Fisioterapia ortopédica",
		professionalCategory: "Fisioterapeuta",
		professionalId: "112233",
		professionalCouncilId: "professional-council-crefito",
		licenseState: "BE",
		licenseDocumentKey:
			"provider-verification/seed_provider_rafael_mendes/crefito-be-112233.pdf",
		licenseDocumentFileName: "crefito-be-112233.pdf",
		licenseDocumentMimeType: "application/pdf",
		licenseDocumentSize: 342_909,
		licenseDocumentSha256:
			"00afadfd48a2370d9f2dced17af78913fa9e50ed6c2df9384262df7fe79e5121",
		verificationStatus: "REJECTED",
		verificationRejectionReason:
			"Documento enviado estava ilegível. Envie uma nova cópia do registro profissional.",
		verifiedAt: null,
		bio: "Fisioterapeuta com atuação em dores crônicas, reabilitação pós-operatória e mobilidade funcional.",
		approach:
			"Avaliação funcional completa, plano de exercícios progressivo e educação em dor.",
		education:
			"Fisioterapia pela UFRJ, especialização em terapia manual e atendimento domiciliar.",
		certifications:
			"Pilates clínico, liberação miofascial e reabilitação esportiva.",
		yearsOfExperience: 10,
		targetAudiences: ["Adultos", "Idosos", "Atletas"],
		serviceModalities: ["IN_PERSON", "HOME_CARE"],
		homeCareRadiusKm: 8,
		acceptedInsurancePlanNames: ["Allianz Private", "Privat"],
		paymentMethods: ["Pix", "Cartão de débito", "Dinheiro"],
		cancellationPolicy:
			"Atendimentos domiciliares cancelados no mesmo dia podem gerar taxa de deslocamento.",
		clinicPhotos: [
			"provider-clinic-photos/seed_provider_rafael_mendes/gym.jpg",
		],
	},
	beatriz: {
		id: "seed_provider_beatriz_nunes",
		email: SEED_PROVIDER_EMAILS[4],
		name: "Dra. Beatriz Nunes",
		firstName: "Beatriz",
		lastName: "Nunes",
		phone: "+493012340305",
		image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400",
		displayName: "Dra. Beatriz Nunes",
		document: "555.666.777-88",
		birthDate: new Date("1990-11-12T00:00:00.000Z"),
		gender: "Feminino",
		languages: ["Português", "Francês", "Inglês"],
		specialty: "Dermatologia estética",
		professionalCategory: "Médica",
		professionalId: "654321",
		professionalCouncilId: "professional-council-crm",
		licenseState: "BE",
		licenseDocumentKey:
			"provider-verification/seed_provider_beatriz_nunes/crm-be-654321.pdf",
		licenseDocumentFileName: "crm-be-654321.pdf",
		licenseDocumentMimeType: "application/pdf",
		licenseDocumentSize: 454_132,
		licenseDocumentSha256:
			"182db50f04f091d045965b931f24c21c1f851d408ba50fb6620f8a8eae15f624",
		verificationStatus: "VERIFIED",
		verifiedAt: new Date("2026-05-02T13:00:00.000Z"),
		bio: "Dermatologista com foco em saúde da pele, acne adulta e procedimentos estéticos minimamente invasivos.",
		approach:
			"Combina rotina de skincare possível com tratamentos em consultório quando indicado.",
		education:
			"Medicina pela UNICAMP, residência em Dermatologia e atualização contínua em cosmiatria.",
		certifications: "SBD, laser dermatológico e cosmiatria.",
		yearsOfExperience: 7,
		targetAudiences: ["Adultos", "Adolescentes"],
		serviceModalities: ["IN_PERSON", "ONLINE"],
		homeCareRadiusKm: null,
		acceptedInsurancePlanNames: ["Signal Iduna", "Privat"],
		paymentMethods: ["Pix", "Cartão de crédito"],
		cancellationPolicy:
			"Procedimentos devem ser cancelados com 48 horas de antecedência.",
		clinicPhotos: [
			"provider-clinic-photos/seed_provider_beatriz_nunes/reception.jpg",
		],
	},
	pedro: {
		id: "seed_provider_pedro_rocha",
		email: SEED_PROVIDER_EMAILS[5],
		name: "Dr. Pedro Rocha",
		firstName: "Pedro",
		lastName: "Rocha",
		phone: "+493012340306",
		image: "https://images.unsplash.com/photo-1637059824899-a441006a6875?w=400",
		displayName: "Dr. Pedro Rocha",
		document: "666.777.888-99",
		birthDate: new Date("1981-05-23T00:00:00.000Z"),
		gender: "Masculino",
		languages: ["Português", "Alemão", "Inglês"],
		specialty: "Odontologia estética",
		professionalCategory: "Dentista",
		professionalId: "77889",
		professionalCouncilId: "professional-council-cro",
		licenseState: "BE",
		licenseDocumentKey:
			"provider-verification/seed_provider_pedro_rocha/cro-be-77889.pdf",
		licenseDocumentFileName: "cro-be-77889.pdf",
		licenseDocumentMimeType: "application/pdf",
		licenseDocumentSize: 298_001,
		licenseDocumentSha256:
			"c3762d1136e2eaf7004f6f23b49e45a1d02e7dc48dcb01197c6b8b9cf07ef9d1",
		verificationStatus: "VERIFIED",
		verifiedAt: new Date("2026-05-03T10:00:00.000Z"),
		bio: "Dentista dedicado a estética dental, lentes de contato e reabilitação oral com planejamento digital.",
		approach:
			"Planejamento digital do sorriso com explicação clara das opções de tratamento.",
		education:
			"Odontologia pela FOUSP, especialização em estética dental e reabilitação oral.",
		certifications: "Implantodontia, facetas cerâmicas e planejamento digital.",
		yearsOfExperience: 13,
		targetAudiences: ["Adultos", "Executivos", "Noivas e noivos"],
		serviceModalities: ["IN_PERSON"],
		homeCareRadiusKm: null,
		acceptedInsurancePlanNames: ["Debeka", "Privat"],
		paymentMethods: ["Pix", "Cartão de crédito", "Boleto"],
		cancellationPolicy:
			"Procedimentos longos exigem confirmação até 24 horas antes.",
		clinicPhotos: [
			"provider-clinic-photos/seed_provider_pedro_rocha/office.jpg",
		],
	},
} as const;

export const OWNER_PERMISSIONS: ClinicPermission[] = [
	"MANAGE_PROVIDER_PROFILE",
	"MANAGE_PROVIDER_SCHEDULE",
	"MANAGE_APPOINTMENTS",
	"MANAGE_PROCEDURES",
	"VIEW_PATIENTS",
	"MANAGE_CLINIC_INFO",
	"MANAGE_STAFF",
];

export const PROVIDER_PERMISSIONS: ClinicPermission[] = [
	"MANAGE_PROVIDER_PROFILE",
	"MANAGE_PROVIDER_SCHEDULE",
	"MANAGE_APPOINTMENTS",
	"MANAGE_PROCEDURES",
	"VIEW_PATIENTS",
];

export function daysFromSeedBase(days: number, hour: number, minute = 0) {
	return new Date(Date.UTC(2026, 4, 10 + days, hour, minute, 0, 0));
}
