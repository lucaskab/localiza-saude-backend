import { prisma } from "@/database/prisma";

type ProviderId = string;

type ScheduleWindow = {
	healthcareProviderId: string;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
};

type AppointmentWindow = {
	healthcareProviderId: string;
	scheduledAt: Date;
	totalDurationMinutes: number;
};

type GetNextAvailableSlotsOptions = {
	now?: Date;
	daysAhead?: number;
};

const DEFAULT_DAYS_AHEAD = 90;

function timeToMinutes(time: string): number {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

function minutesToUtcDate(day: Date, minutes: number): Date {
	const date = new Date(day);
	date.setUTCHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
	return date;
}

function startOfUtcDay(date: Date): Date {
	const start = new Date(date);
	start.setUTCHours(0, 0, 0, 0);
	return start;
}

function endOfUtcDay(date: Date): Date {
	const end = new Date(date);
	end.setUTCHours(23, 59, 59, 999);
	return end;
}

function addUtcDays(date: Date, days: number): Date {
	const next = new Date(date);
	next.setUTCDate(next.getUTCDate() + days);
	return next;
}

function hasDateOverlap(
	startA: Date,
	endA: Date,
	startB: Date,
	endB: Date,
): boolean {
	return startA < endB && endA > startB;
}

function groupByProvider<T extends { healthcareProviderId: string }>(
	items: T[],
): Map<ProviderId, T[]> {
	const grouped = new Map<ProviderId, T[]>();

	for (const item of items) {
		const providerItems = grouped.get(item.healthcareProviderId) ?? [];
		providerItems.push(item);
		grouped.set(item.healthcareProviderId, providerItems);
	}

	return grouped;
}

export async function getNextAvailableSlotsByProviderIds(
	providerIds: string[],
	options: GetNextAvailableSlotsOptions = {},
): Promise<Map<ProviderId, Date | null>> {
	const uniqueProviderIds = Array.from(new Set(providerIds));
	const nextAvailableByProviderId = new Map<ProviderId, Date | null>(
		uniqueProviderIds.map((providerId) => [providerId, null]),
	);

	if (uniqueProviderIds.length === 0) {
		return nextAvailableByProviderId;
	}

	const now = options.now ?? new Date();
	const daysAhead = options.daysAhead ?? DEFAULT_DAYS_AHEAD;
	const searchStart = startOfUtcDay(now);
	const searchEnd = endOfUtcDay(addUtcDays(searchStart, daysAhead));

	const [procedures, schedules, appointments] = await Promise.all([
		prisma.procedure.findMany({
			where: {
				healthcareProviderId: { in: uniqueProviderIds },
			},
			select: {
				healthcareProviderId: true,
				durationInMinutes: true,
			},
			orderBy: {
				durationInMinutes: "asc",
			},
		}),
		prisma.healthcare_provider_schedule.findMany({
			where: {
				healthcareProviderId: { in: uniqueProviderIds },
				isActive: true,
			},
			select: {
				healthcareProviderId: true,
				dayOfWeek: true,
				startTime: true,
				endTime: true,
			},
			orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
		}),
		prisma.appointment.findMany({
			where: {
				healthcareProviderId: { in: uniqueProviderIds },
				scheduledAt: {
					gte: searchStart,
					lte: searchEnd,
				},
				status: {
					not: "CANCELLED",
				},
			},
			select: {
				healthcareProviderId: true,
				scheduledAt: true,
				totalDurationMinutes: true,
			},
			orderBy: {
				scheduledAt: "asc",
			},
		}),
	]);

	const proceduresByProvider = groupByProvider(procedures);
	const schedulesByProvider = groupByProvider(
		schedules as ScheduleWindow[],
	);
	const appointmentsByProvider = groupByProvider(
		appointments as AppointmentWindow[],
	);

	for (const providerId of uniqueProviderIds) {
		const providerProcedures = proceduresByProvider.get(providerId) ?? [];
		const shortestProcedure = providerProcedures[0];
		const providerSchedules = schedulesByProvider.get(providerId) ?? [];

		if (!shortestProcedure || providerSchedules.length === 0) {
			continue;
		}

		const appointmentDurationMinutes = shortestProcedure.durationInMinutes;
		const providerAppointments = appointmentsByProvider.get(providerId) ?? [];

		for (let dayOffset = 0; dayOffset <= daysAhead; dayOffset++) {
			const day = addUtcDays(searchStart, dayOffset);
			const dayOfWeek = day.getUTCDay();
			const daySchedules = providerSchedules
				.filter((schedule) => schedule.dayOfWeek === dayOfWeek)
				.sort(
					(a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
				);

			for (const schedule of daySchedules) {
				const scheduleStart = timeToMinutes(schedule.startTime);
				const scheduleEnd = timeToMinutes(schedule.endTime);

				for (
					let slotStartMinutes = scheduleStart;
					slotStartMinutes + appointmentDurationMinutes <= scheduleEnd;
					slotStartMinutes += appointmentDurationMinutes
				) {
					const slotStart = minutesToUtcDate(day, slotStartMinutes);
					if (slotStart <= now) {
						continue;
					}

					const slotEnd = new Date(
						slotStart.getTime() + appointmentDurationMinutes * 60 * 1000,
					);

					const hasConflict = providerAppointments.some((appointment) => {
						const appointmentStart = new Date(appointment.scheduledAt);
						const appointmentEnd = new Date(
							appointmentStart.getTime() +
								appointment.totalDurationMinutes * 60 * 1000,
						);

						return hasDateOverlap(
							slotStart,
							slotEnd,
							appointmentStart,
							appointmentEnd,
						);
					});

					if (!hasConflict) {
						nextAvailableByProviderId.set(providerId, slotStart);
						break;
					}
				}

				if (nextAvailableByProviderId.get(providerId)) {
					break;
				}
			}

			if (nextAvailableByProviderId.get(providerId)) {
				break;
			}
		}
	}

	return nextAvailableByProviderId;
}
