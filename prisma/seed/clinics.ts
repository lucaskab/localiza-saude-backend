import {
	OWNER_PERMISSIONS,
	PROVIDER_PERMISSIONS,
	STAFF_PERMISSIONS,
} from "./constants";
import type { SeedClient, SeedClinics, SeedUsers } from "./types";

export async function seedClinics(
	prisma: SeedClient,
	users: SeedUsers,
): Promise<SeedClinics> {
	console.log("🏥 Seeding clinics and clinic employees...");

	const lucasConsultorio = await prisma.clinic.create({
		data: {
			name: "Consultório Dr. Lucas Furini",
			type: "MEDICAL",
			phone: "+551130001000",
			email: "lucas.furini.clinica@localizasaude.seed",
			description:
				"Consultório próprio para clínica geral, check-ups e acompanhamento preventivo.",
			address: "Av. Paulista, 900 - Bela Vista, São Paulo - SP, 01310-100",
			latitude: -23.564186,
			longitude: -46.652741,
			ownerId: users.providers.lucas.id,
		},
	});

	const paulista = await prisma.clinic.create({
		data: {
			name: "Localiza Saúde Paulista",
			type: "MEDICAL",
			phone: "+551130001001",
			email: "paulista@localizasaude.seed",
			description:
				"Clínica multidisciplinar com consultórios para atendimento presencial e online.",
			address: "Av. Paulista, 1578 - Bela Vista, São Paulo - SP, 01310-200",
			latitude: -23.561684,
			longitude: -46.655981,
			ownerId: users.providers.ana.id,
		},
	});

	const pinheiros = await prisma.clinic.create({
		data: {
			name: "Clínica Integrada Pinheiros",
			type: "HEALTH",
			phone: "+551130001002",
			email: "pinheiros@localizasaude.seed",
			description:
				"Núcleo de nutrição, psicologia e prevenção com foco em cuidado continuado.",
			address: "Rua Oscar Freire, 2250 - Pinheiros, São Paulo - SP, 05409-011",
			latitude: -23.561321,
			longitude: -46.681412,
			ownerId: users.providers.carlos.id,
		},
	});

	const copacabana = await prisma.clinic.create({
		data: {
			name: "Movimento Copacabana",
			type: "HEALTH",
			phone: "+552130001003",
			email: "copacabana@localizasaude.seed",
			description:
				"Espaço para reabilitação, fisioterapia ortopédica e atendimento domiciliar.",
			address:
				"Av. Nossa Senhora de Copacabana, 680 - Copacabana, Rio de Janeiro - RJ",
			latitude: -22.970722,
			longitude: -43.186874,
			ownerId: users.providers.rafael.id,
		},
	});

	const sorriso = await prisma.clinic.create({
		data: {
			name: "Sorriso Jardins",
			type: "DENTAL",
			phone: "+551130001004",
			email: "sorriso@localizasaude.seed",
			description:
				"Clínica odontológica com estética dental, planejamento digital e reabilitação oral.",
			address: "Rua Augusta, 2203 - Cerqueira César, São Paulo - SP, 01413-100",
			latitude: -23.560973,
			longitude: -46.662433,
			ownerId: users.providers.pedro.id,
		},
	});

	await prisma.clinic_employee.createMany({
		data: [
			{
				clinicId: lucasConsultorio.id,
				userId: users.providers.lucas.id,
				role: "OWNER",
				permissions: OWNER_PERMISSIONS,
			},
			{
				clinicId: paulista.id,
				userId: users.providers.ana.id,
				role: "OWNER",
				permissions: OWNER_PERMISSIONS,
			},
			{
				clinicId: paulista.id,
				userId: users.providers.beatriz.id,
				role: "PROVIDER",
				permissions: PROVIDER_PERMISSIONS,
			},
			{
				clinicId: paulista.id,
				userId: users.staff.recepcaoPaulista.id,
				role: "STAFF",
				permissions: STAFF_PERMISSIONS,
			},
			{
				clinicId: pinheiros.id,
				userId: users.providers.carlos.id,
				role: "OWNER",
				permissions: OWNER_PERMISSIONS,
			},
			{
				clinicId: pinheiros.id,
				userId: users.providers.marina.id,
				role: "PROVIDER",
				permissions: PROVIDER_PERMISSIONS,
			},
			{
				clinicId: pinheiros.id,
				userId: users.staff.agendaPinheiros.id,
				role: "STAFF",
				permissions: STAFF_PERMISSIONS,
			},
			{
				clinicId: copacabana.id,
				userId: users.providers.rafael.id,
				role: "OWNER",
				permissions: OWNER_PERMISSIONS,
			},
			{
				clinicId: sorriso.id,
				userId: users.providers.pedro.id,
				role: "OWNER",
				permissions: OWNER_PERMISSIONS,
			},
		],
	});

	console.log("✅ Created 5 clinics and 9 clinic employee links");

	return {
		lucasConsultorio,
		paulista,
		pinheiros,
		copacabana,
		sorriso,
	};
}
