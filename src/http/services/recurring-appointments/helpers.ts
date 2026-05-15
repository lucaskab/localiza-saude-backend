export const DEFAULT_BOOKING_AVAILABILITY_DAYS = 90;
export const MAX_BOOKING_AVAILABILITY_DAYS = 365;

export type RecurringWeeklySlotInput = {
	dayOfWeek: number;
	startTime: string;
};

export function startOfUtcDay(date: Date) {
	const result = new Date(date);
	result.setUTCHours(0, 0, 0, 0);
	return result;
}

export function endOfUtcDay(date: Date) {
	const result = new Date(date);
	result.setUTCHours(23, 59, 59, 999);
	return result;
}

export function addUtcDays(date: Date, days: number) {
	const result = new Date(date);
	result.setUTCDate(result.getUTCDate() + days);
	return result;
}

export function parseUtcDateInput(date: string) {
	const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

export function timeToMinutes(time: string) {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

export function dateTimeToMinutes(date: Date) {
	return date.getUTCHours() * 60 + date.getUTCMinutes();
}

export function formatTimeFromDate(date: Date) {
	return `${date.getUTCHours().toString().padStart(2, "0")}:${date
		.getUTCMinutes()
		.toString()
		.padStart(2, "0")}`;
}

export function hasTimeOverlap(
	startA: number,
	endA: number,
	startB: number,
	endB: number,
) {
	return startA < endB && endA > startB;
}

export function hasDateOverlap(
	startA: Date,
	endA: Date,
	startB: Date,
	endB: Date,
) {
	return startA < endB && endA > startB;
}

export function isValidTimeRange(startTime: string, endTime: string) {
	return timeToMinutes(startTime) < timeToMinutes(endTime);
}

export function buildUtcDateWithTime(date: Date, time: string) {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			hours,
			minutes,
			0,
			0,
		),
	);
}

export function normalizeWeeklySlots(
	scheduledAt: Date,
	weeklySlots: RecurringWeeklySlotInput[],
) {
	const uniqueSlots = new Map<string, RecurringWeeklySlotInput>();
	const primarySlot = {
		dayOfWeek: scheduledAt.getUTCDay(),
		startTime: formatTimeFromDate(scheduledAt),
	};

	for (const slot of [primarySlot, ...weeklySlots]) {
		const key = `${slot.dayOfWeek}-${slot.startTime}`;
		if (!uniqueSlots.has(key)) {
			uniqueSlots.set(key, slot);
		}
	}

	return Array.from(uniqueSlots.values()).sort((a, b) => {
		if (a.dayOfWeek !== b.dayOfWeek) {
			return a.dayOfWeek - b.dayOfWeek;
		}

		return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
	});
}

export function uniqueWeeklySlots(weeklySlots: RecurringWeeklySlotInput[]) {
	const uniqueSlots = new Map<string, RecurringWeeklySlotInput>();

	for (const slot of weeklySlots) {
		const key = `${slot.dayOfWeek}-${slot.startTime}`;
		if (!uniqueSlots.has(key)) {
			uniqueSlots.set(key, slot);
		}
	}

	return Array.from(uniqueSlots.values()).sort((a, b) => {
		if (a.dayOfWeek !== b.dayOfWeek) {
			return a.dayOfWeek - b.dayOfWeek;
		}

		return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
	});
}

export function getBookingWindowEndDate(
	bookingAvailabilityDays: number | null | undefined,
	referenceDate = new Date(),
) {
	const normalizedDays = Math.min(
		Math.max(bookingAvailabilityDays ?? DEFAULT_BOOKING_AVAILABILITY_DAYS, 1),
		MAX_BOOKING_AVAILABILITY_DAYS,
	);

	return endOfUtcDay(addUtcDays(startOfUtcDay(referenceDate), normalizedDays));
}

export function formatConflictDate(date: Date) {
	return date.toISOString().slice(0, 16).replace("T", " ");
}

export function buildWorkingRangesForDate({
	date,
	schedules,
	exceptions,
}: {
	date: Date;
	schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
	exceptions: Array<{
		type: string;
		startTime: string | null;
		endTime: string | null;
	}>;
}) {
	const hasFullDayOff = exceptions.some(
		(exception) =>
			exception.type === "DAY_OFF" &&
			(!exception.startTime || !exception.endTime),
	);

	if (hasFullDayOff) {
		return {
			workingRanges: [] as Array<{ startTime: string; endTime: string }>,
			blockedRanges: [] as Array<{ startTime: string; endTime: string }>,
		};
	}

	const dayOfWeek = date.getUTCDay();
	const recurringRanges = schedules
		.filter((schedule) => schedule.dayOfWeek === dayOfWeek)
		.map((schedule) => ({
			startTime: schedule.startTime,
			endTime: schedule.endTime,
		}))
		.filter((range) => isValidTimeRange(range.startTime, range.endTime));

	const specialRanges = exceptions
		.filter(
			(exception) =>
				exception.type === "SPECIAL_HOURS" &&
				exception.startTime &&
				exception.endTime,
		)
		.map((exception) => ({
			startTime: exception.startTime as string,
			endTime: exception.endTime as string,
		}))
		.filter((range) => isValidTimeRange(range.startTime, range.endTime));

	const extraRanges = exceptions
		.filter(
			(exception) =>
				exception.type === "EXTRA_SLOT" &&
				exception.startTime &&
				exception.endTime,
		)
		.map((exception) => ({
			startTime: exception.startTime as string,
			endTime: exception.endTime as string,
		}))
		.filter((range) => isValidTimeRange(range.startTime, range.endTime));

	const workingRanges = [
		...(specialRanges.length > 0 ? specialRanges : recurringRanges),
		...extraRanges,
	];
	const blockedRanges = exceptions
		.filter(
			(exception) =>
				(exception.type === "DAY_OFF" || exception.type === "TIME_BLOCK") &&
				exception.startTime &&
				exception.endTime,
		)
		.map((exception) => ({
			startTime: exception.startTime as string,
			endTime: exception.endTime as string,
		}))
		.filter((range) => isValidTimeRange(range.startTime, range.endTime));

	return { workingRanges, blockedRanges };
}

export function canOccurrenceFitInSchedule({
	occurrenceStart,
	durationMinutes,
	schedules,
	exceptions,
}: {
	occurrenceStart: Date;
	durationMinutes: number;
	schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
	exceptions: Array<{
		type: string;
		startTime: string | null;
		endTime: string | null;
	}>;
}) {
	const { workingRanges, blockedRanges } = buildWorkingRangesForDate({
		date: occurrenceStart,
		schedules,
		exceptions,
	});

	if (workingRanges.length === 0) {
		return false;
	}

	const occurrenceStartMinutes = dateTimeToMinutes(occurrenceStart);
	const occurrenceEndMinutes = occurrenceStartMinutes + durationMinutes;

	const fitsWorkingRange = workingRanges.some((range) => {
		const rangeStart = timeToMinutes(range.startTime);
		const rangeEnd = timeToMinutes(range.endTime);

		return (
			occurrenceStartMinutes >= rangeStart &&
			occurrenceEndMinutes <= rangeEnd
		);
	});

	if (!fitsWorkingRange) {
		return false;
	}

	return !blockedRanges.some((range) =>
		hasTimeOverlap(
			occurrenceStartMinutes,
			occurrenceEndMinutes,
			timeToMinutes(range.startTime),
			timeToMinutes(range.endTime),
		),
	);
}

export function mapExceptionsByDate<
	T extends {
		date: Date;
		type: string;
		startTime: string | null;
		endTime: string | null;
	},
>(exceptions: T[]) {
	const map = new Map<string, T[]>();

	for (const exception of exceptions) {
		const key = exception.date.toISOString().slice(0, 10);
		const current = map.get(key) ?? [];
		current.push(exception);
		map.set(key, current);
	}

	return map;
}
