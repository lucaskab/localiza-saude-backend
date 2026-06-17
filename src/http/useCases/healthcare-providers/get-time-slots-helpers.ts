export type TimeSlot = {
	startTime: string;
	endTime: string;
	available: boolean;
};

export type TimeRange = {
	startTime: string;
	endTime: string;
};

const DEFAULT_BOOKING_AVAILABILITY_DAYS = 90;
const MAX_BOOKING_AVAILABILITY_DAYS = 365;
const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo";

export function timeToMinutes(time: string): number {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function getDayOfWeek(date: Date): number {
	return date.getUTCDay();
}

export function hasTimeOverlap(
	slotStart: number,
	slotEnd: number,
	apptStart: number,
	apptEnd: number,
): boolean {
	return slotStart < apptEnd && slotEnd > apptStart;
}

export function isValidRange(range: TimeRange): boolean {
	return timeToMinutes(range.startTime) < timeToMinutes(range.endTime);
}

export function getRangeBounds(ranges: TimeRange[]) {
	if (ranges.length === 0) {
		return {
			startTime: "00:00",
			endTime: "00:00",
		};
	}

	const startMinutes = Math.min(
		...ranges.map((range) => timeToMinutes(range.startTime)),
	);
	const endMinutes = Math.max(
		...ranges.map((range) => timeToMinutes(range.endTime)),
	);

	return {
		startTime: minutesToTime(startMinutes),
		endTime: minutesToTime(endMinutes),
	};
}

export function parseUtcDateString(date: string): Date {
	const [year, month, day] = date.split("-").map(Number);
	return new Date(Date.UTC(year || 0, (month || 1) - 1, day || 1));
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

export function getBookingWindowEndDate(
	bookingAvailabilityDays: number | null | undefined,
	referenceDate = new Date(),
) {
	const normalizedDays = Math.min(
		Math.max(bookingAvailabilityDays ?? DEFAULT_BOOKING_AVAILABILITY_DAYS, 1),
		MAX_BOOKING_AVAILABILITY_DAYS,
	);

	const start = new Date(referenceDate);
	start.setUTCHours(0, 0, 0, 0);

	return endOfUtcDay(addUtcDays(start, normalizedDays));
}

export function getCurrentSaoPauloDateTime(referenceDate = new Date()) {
	const formatter = new Intl.DateTimeFormat("en-CA", {
		timeZone: SAO_PAULO_TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
	const parts = formatter.formatToParts(referenceDate);
	const values = Object.fromEntries(
		parts
			.filter((part) => part.type !== "literal")
			.map((part) => [part.type, part.value]),
	) as Record<string, string>;

	return {
		date: `${values.year}-${values.month}-${values.day}`,
		minutes: Number(values.hour || "0") * 60 + Number(values.minute || "0"),
	};
}
