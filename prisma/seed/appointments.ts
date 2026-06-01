import { daysFromSeedBase } from "./constants";
import type {
	SeedAppointments,
	SeedClient,
	SeedPatientProfiles,
	SeedProcedures,
	SeedUsers,
} from "./types";

async function createAppointmentWithProcedures({
	prisma,
	customerId,
	patientProfileId,
	healthcareProviderId,
	procedureIds,
	procedures,
	scheduledAt,
	status,
	serviceModality,
	notes,
	onlineMeetingUrl,
}: {
	prisma: SeedClient;
	customerId: string;
	patientProfileId?: string;
	healthcareProviderId: string;
	procedureIds: string[];
	procedures: SeedProcedures;
	scheduledAt: Date;
	status:
		| "SCHEDULED"
		| "CONFIRMED"
		| "IN_PROGRESS"
		| "COMPLETED"
		| "CANCELLED"
		| "NO_SHOW";
	serviceModality: "IN_PERSON" | "ONLINE" | "HOME_CARE";
	notes?: string;
	onlineMeetingUrl?: string;
}) {
	const selectedProcedures = procedureIds.map((id) => procedures[id]);

	return prisma.appointment.create({
		data: {
			customerId,
			patientProfileId,
			healthcareProviderId,
			scheduledAt,
			status,
			serviceModality,
			onlineMeetingUrl,
			onlineMeetingProvider: onlineMeetingUrl ? "GOOGLE_MEET" : null,
			onlineMeetingExternalId: onlineMeetingUrl
				? `seed-meet-${scheduledAt.getTime()}`
				: null,
			onlineMeetingCreatedAt: onlineMeetingUrl
				? new Date("2026-05-10T10:00:00.000Z")
				: null,
			totalDurationMinutes: selectedProcedures.reduce(
				(total, procedure) => total + procedure.durationInMinutes,
				0,
			),
			totalPriceCents: selectedProcedures.reduce(
				(total, procedure) => total + procedure.priceInCents,
				0,
			),
			notes,
			appointmentProcedures: {
				create: selectedProcedures.map((procedure) => ({
					procedureId: procedure.id,
				})),
			},
		},
	});
}

export async function seedAppointments(
	prisma: SeedClient,
	users: SeedUsers,
	procedures: SeedProcedures,
	patientProfiles: SeedPatientProfiles,
): Promise<SeedAppointments> {
	console.log("🗓️  Seeding appointments and reschedule requests...");

	const lucasCardio = await createAppointmentWithProcedures({
		prisma,
		customerId: users.customers.lucas.id,
		patientProfileId: patientProfiles.lucasSelf.id,
		healthcareProviderId: users.providers.ana.id,
		procedureIds: ["ana1", "ana2"],
		procedures,
		scheduledAt: daysFromSeedBase(2, 13),
		status: "CONFIRMED",
		serviceModality: "ONLINE",
		onlineMeetingUrl: "https://meet.google.com/seed-lucas-cardio",
		notes: "Consulta online confirmada com link de Google Meet.",
	});

	const lucasNutrition = await createAppointmentWithProcedures({
		prisma,
		customerId: users.customers.lucas.id,
		patientProfileId: patientProfiles.lucasSelf.id,
		healthcareProviderId: users.providers.carlos.id,
		procedureIds: ["carlos1"],
		procedures,
		scheduledAt: daysFromSeedBase(4, 14),
		status: "SCHEDULED",
		serviceModality: "IN_PERSON",
		notes: "Primeira consulta nutricional.",
	});

	const lucasProviderOnline = await createAppointmentWithProcedures({
		prisma,
		customerId: users.customers.juliana.id,
		patientProfileId: patientProfiles.julianaSelf.id,
		healthcareProviderId: users.providers.lucas.id,
		procedureIds: ["lucas1", "lucas2"],
		procedures,
		scheduledAt: daysFromSeedBase(1, 10),
		status: "CONFIRMED",
		serviceModality: "ONLINE",
		onlineMeetingUrl: "https://meet.google.com/seed-provider-lucas-online",
		notes: "Consulta online confirmada para validar agenda do provider Lucas.",
	});

	const lucasProviderInPerson = await createAppointmentWithProcedures({
		prisma,
		customerId: users.customers.lucas.id,
		patientProfileId: patientProfiles.lucasSelf.id,
		healthcareProviderId: users.providers.lucas.id,
		procedureIds: ["lucas3"],
		procedures,
		scheduledAt: daysFromSeedBase(6, 15),
		status: "SCHEDULED",
		serviceModality: "IN_PERSON",
		notes: "Check-up presencial na praxis em Berlin Mitte.",
	});

	const lucasProviderCompleted = await createAppointmentWithProcedures({
		prisma,
		customerId: users.customers.juliana.id,
		patientProfileId: patientProfiles.julianaSelf.id,
		healthcareProviderId: users.providers.lucas.id,
		procedureIds: ["lucas1"],
		procedures,
		scheduledAt: daysFromSeedBase(-7, 9),
		status: "COMPLETED",
		serviceModality: "IN_PERSON",
		notes: "Consulta concluída para alimentar avaliações do provider Lucas.",
	});

	const lucasHomeCare = await createAppointmentWithProcedures({
		prisma,
		customerId: users.customers.lucas.id,
		patientProfileId: patientProfiles.lucasFamily.id,
		healthcareProviderId: users.providers.rafael.id,
		procedureIds: ["rafael2"],
		procedures,
		scheduledAt: daysFromSeedBase(5, 10),
		status: "SCHEDULED",
		serviceModality: "HOME_CARE",
		notes: "Atendimento domiciliar para perfil familiar.",
	});

	const julianaDermato = await createAppointmentWithProcedures({
		prisma,
		customerId: users.customers.juliana.id,
		patientProfileId: patientProfiles.julianaSelf.id,
		healthcareProviderId: users.providers.beatriz.id,
		procedureIds: ["beatriz1"],
		procedures,
		scheduledAt: daysFromSeedBase(3, 16),
		status: "CONFIRMED",
		serviceModality: "IN_PERSON",
		notes: "Consulta presencial confirmada.",
	});

	const completedDental = await createAppointmentWithProcedures({
		prisma,
		customerId: users.customers.juliana.id,
		patientProfileId: patientProfiles.julianaSelf.id,
		healthcareProviderId: users.providers.pedro.id,
		procedureIds: ["pedro1", "pedro2"],
		procedures,
		scheduledAt: daysFromSeedBase(-12, 9),
		status: "COMPLETED",
		serviceModality: "IN_PERSON",
		notes: "Consulta concluída para alimentar avaliações.",
	});

	const completedPsychology = await createAppointmentWithProcedures({
		prisma,
		customerId: users.customers.lucas.id,
		patientProfileId: patientProfiles.lucasSelf.id,
		healthcareProviderId: users.providers.marina.id,
		procedureIds: ["marina1"],
		procedures,
		scheduledAt: daysFromSeedBase(-6, 18),
		status: "COMPLETED",
		serviceModality: "ONLINE",
		onlineMeetingUrl: "https://meet.google.com/seed-lucas-therapy",
		notes: "Sessão online concluída.",
	});

	const inProgressCardio = await createAppointmentWithProcedures({
		prisma,
		customerId: users.customers.lucas.id,
		patientProfileId: patientProfiles.lucasSelf.id,
		healthcareProviderId: users.providers.ana.id,
		procedureIds: ["ana1"],
		procedures,
		scheduledAt: daysFromSeedBase(0, 9),
		status: "IN_PROGRESS",
		serviceModality: "IN_PERSON",
		notes: "Consulta em andamento para validar status operacional.",
	});

	const cancelledNutrition = await createAppointmentWithProcedures({
		prisma,
		customerId: users.customers.lucas.id,
		patientProfileId: patientProfiles.lucasSelf.id,
		healthcareProviderId: users.providers.carlos.id,
		procedureIds: ["carlos2"],
		procedures,
		scheduledAt: daysFromSeedBase(-2, 15),
		status: "CANCELLED",
		serviceModality: "ONLINE",
		notes: "Consulta cancelada pelo cliente.",
	});

	const noShowPhysio = await createAppointmentWithProcedures({
		prisma,
		customerId: users.customers.juliana.id,
		patientProfileId: patientProfiles.julianaSelf.id,
		healthcareProviderId: users.providers.rafael.id,
		procedureIds: ["rafael1"],
		procedures,
		scheduledAt: daysFromSeedBase(-1, 11),
		status: "NO_SHOW",
		serviceModality: "HOME_CARE",
		notes: "No-show fictício para validar filtros de consulta.",
	});

	await prisma.appointment_reschedule_request.createMany({
		data: [
			{
				appointmentId: lucasProviderInPerson.id,
				requestedByUserId: users.providers.lucas.id,
				proposedScheduledAt: daysFromSeedBase(7, 16),
				status: "PENDING",
				reason:
					"Provider Lucas propôs ajuste de horário para validar fluxo de aceite pelo cliente.",
			},
			{
				appointmentId: lucasNutrition.id,
				requestedByUserId: users.customers.lucas.id,
				proposedScheduledAt: daysFromSeedBase(7, 11),
				status: "PENDING",
				reason:
					"Cliente solicitou reagendamento para encaixar melhor na agenda.",
			},
			{
				appointmentId: julianaDermato.id,
				requestedByUserId: users.providers.beatriz.id,
				proposedScheduledAt: daysFromSeedBase(8, 15),
				status: "PENDING",
				reason:
					"Provider pediu alteração por conflito com procedimento anterior.",
			},
			{
				appointmentId: completedDental.id,
				requestedByUserId: users.customers.juliana.id,
				proposedScheduledAt: daysFromSeedBase(-10, 10),
				status: "ACCEPTED",
				respondedAt: daysFromSeedBase(-14, 12),
				reason: "Reagendamento aceito antes da consulta concluída.",
			},
			{
				appointmentId: cancelledNutrition.id,
				requestedByUserId: users.providers.carlos.id,
				proposedScheduledAt: daysFromSeedBase(1, 16),
				status: "DECLINED",
				respondedAt: daysFromSeedBase(-1, 10),
				reason: "Cliente recusou alteração proposta pelo provider.",
			},
			{
				appointmentId: noShowPhysio.id,
				requestedByUserId: users.customers.juliana.id,
				proposedScheduledAt: daysFromSeedBase(2, 8),
				status: "CANCELLED",
				respondedAt: daysFromSeedBase(-1, 9),
				reason: "Solicitação cancelada antes da resposta.",
			},
		],
	});

	console.log(
		"✅ Created appointments covering online, in-person, home care and rescheduling",
	);

	return {
		lucasCardio,
		lucasNutrition,
		lucasProviderOnline,
		lucasProviderInPerson,
		lucasProviderCompleted,
		lucasHomeCare,
		julianaDermato,
		completedDental,
		completedPsychology,
		inProgressCardio,
		cancelledNutrition,
		noShowPhysio,
	};
}
