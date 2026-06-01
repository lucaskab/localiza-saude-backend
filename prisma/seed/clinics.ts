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
			name: "Praxis Dr. Lucas Furini",
			type: "MEDICAL",
			phone: "+493012340400",
			email: "lucas.furini.clinica@localizasaude.seed",
			description:
				"Praxis própria para clínica geral, check-ups e acompanhamento preventivo em Berlin Mitte.",
			ownerId: users.providers.lucas.id,
		},
	});

	const paulista = await prisma.clinic.create({
		data: {
			name: "Localiza Mitte Medical",
			type: "MEDICAL",
			phone: "+493012340401",
			email: "paulista@localizasaude.seed",
			description:
				"Clínica multidisciplinar com consultórios para atendimento presencial e online em Berlin Mitte.",
			ownerId: users.providers.ana.id,
		},
	});

	const pinheiros = await prisma.clinic.create({
		data: {
			name: "Kreuzberg Health Hub",
			type: "HEALTH",
			phone: "+493012340402",
			email: "pinheiros@localizasaude.seed",
			description:
				"Núcleo de nutrição, psicologia e prevenção com foco em cuidado continuado em Kreuzberg.",
			ownerId: users.providers.carlos.id,
		},
	});

	const copacabana = await prisma.clinic.create({
		data: {
			name: "Prenzlauer Physio Lab",
			type: "HEALTH",
			phone: "+493012340403",
			email: "copacabana@localizasaude.seed",
			description:
				"Espaço para reabilitação, fisioterapia ortopédica e atendimento domiciliar em Prenzlauer Berg.",
			ownerId: users.providers.rafael.id,
		},
	});

	const sorriso = await prisma.clinic.create({
		data: {
			name: "KuDamm Smile Studio",
			type: "DENTAL",
			phone: "+493012340404",
			email: "sorriso@localizasaude.seed",
			description:
				"Clínica odontológica com estética dental, planejamento digital e reabilitação oral em Charlottenburg.",
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
