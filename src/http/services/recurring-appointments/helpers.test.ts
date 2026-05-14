import { describe, expect, test } from "bun:test";
import {
	buildWorkingRangesForDate,
	canOccurrenceFitInSchedule,
	formatTimeFromDate,
	getBookingWindowEndDate,
	normalizeWeeklySlots,
	type RecurringWeeklySlotInput,
} from "./helpers";

describe("recurring appointment helpers", () => {
	test("normalizeWeeklySlots adds the primary slot and removes duplicates", () => {
		const scheduledAt = new Date("2026-06-01T09:00:00.000Z");
		const weeklySlots: RecurringWeeklySlotInput[] = [
			{ dayOfWeek: 1, startTime: "09:00" },
			{ dayOfWeek: 3, startTime: "10:30" },
			{ dayOfWeek: 3, startTime: "10:30" },
		];

		const result = normalizeWeeklySlots(scheduledAt, weeklySlots);

		expect(result).toEqual([
			{ dayOfWeek: 1, startTime: formatTimeFromDate(scheduledAt) },
			{ dayOfWeek: 3, startTime: "10:30" },
		]);
	});

	test("getBookingWindowEndDate clamps values inside the supported range", () => {
		const referenceDate = new Date("2026-06-01T10:00:00.000Z");

		expect(getBookingWindowEndDate(0, referenceDate).toISOString()).toBe(
			"2026-06-02T23:59:59.999Z",
		);
		expect(getBookingWindowEndDate(999, referenceDate).toISOString()).toBe(
			"2027-06-01T23:59:59.999Z",
		);
	});

	test("buildWorkingRangesForDate prioritizes special hours and keeps extra slots", () => {
		const date = new Date("2026-06-03T10:00:00.000Z");

		const result = buildWorkingRangesForDate({
			date,
			schedules: [{ dayOfWeek: 3, startTime: "09:00", endTime: "18:00" }],
			exceptions: [
				{ type: "SPECIAL_HOURS", startTime: "08:00", endTime: "12:00" },
				{ type: "EXTRA_SLOT", startTime: "19:00", endTime: "20:00" },
				{ type: "TIME_BLOCK", startTime: "10:00", endTime: "10:30" },
			],
		});

		expect(result.workingRanges).toEqual([
			{ startTime: "08:00", endTime: "12:00" },
			{ startTime: "19:00", endTime: "20:00" },
		]);
		expect(result.blockedRanges).toEqual([
			{ startTime: "10:00", endTime: "10:30" },
		]);
	});

	test("canOccurrenceFitInSchedule returns false when a blocked range overlaps the occurrence", () => {
		const occurrenceStart = new Date("2026-06-03T10:00:00.000Z");

		const result = canOccurrenceFitInSchedule({
			occurrenceStart,
			durationMinutes: 60,
			schedules: [{ dayOfWeek: 3, startTime: "09:00", endTime: "18:00" }],
			exceptions: [{ type: "TIME_BLOCK", startTime: "10:30", endTime: "11:30" }],
		});

		expect(result).toBe(false);
	});
});
