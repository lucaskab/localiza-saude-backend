import type { SeedClient, SeedUsers } from "./types";

function nextDateForWeekday(dayOfWeek: number, minimumDaysAhead = 1) {
	const date = new Date();
	date.setUTCHours(0, 0, 0, 0);
	date.setUTCDate(date.getUTCDate() + minimumDaysAhead);

	while (date.getUTCDay() !== dayOfWeek) {
		date.setUTCDate(date.getUTCDate() + 1);
	}

	return date;
}

export async function seedScheduleExceptions(
	prisma: SeedClient,
	users: SeedUsers,
) {
	console.log("🗓️  Seeding schedule exceptions...");

	const lucasMonday = nextDateForWeekday(1);
	const lucasTuesday = nextDateForWeekday(2);
	const lucasWednesday = nextDateForWeekday(3);
	const anaFriday = nextDateForWeekday(5);
	const carlosSunday = nextDateForWeekday(0);

	await prisma.healthcare_provider_schedule_exception.createMany({
		data: [
			{
				healthcareProviderId: users.providers.lucas.id,
				date: lucasMonday,
				type: "TIME_BLOCK",
				startTime: "09:30",
				endTime: "10:30",
				reason: "Bloqueio para reunião clínica",
			},
			{
				healthcareProviderId: users.providers.lucas.id,
				date: lucasTuesday,
				type: "SPECIAL_HOURS",
				startTime: "10:00",
				endTime: "15:00",
				reason: "Horário especial por plantão matinal",
			},
			{
				healthcareProviderId: users.providers.lucas.id,
				date: lucasWednesday,
				type: "EXTRA_SLOT",
				startTime: "18:00",
				endTime: "20:00",
				reason: "Encaixes de fim de dia",
			},
			{
				healthcareProviderId: users.providers.ana.id,
				date: anaFriday,
				type: "DAY_OFF",
				reason: "Férias",
			},
			{
				healthcareProviderId: users.providers.carlos.id,
				date: carlosSunday,
				type: "EXTRA_SLOT",
				startTime: "09:00",
				endTime: "12:00",
				reason: "Mutirão nutricional de domingo",
			},
		],
	});

	console.log("✅ Created schedule exceptions");
}
