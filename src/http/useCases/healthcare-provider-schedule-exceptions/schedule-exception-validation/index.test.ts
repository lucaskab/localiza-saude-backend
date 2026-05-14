import { describe, expect, test } from "bun:test";
import type { ScheduleExceptionType } from "../../../../../prisma/generated/prisma/client";
import {
	normalizeScheduleExceptionDate,
	validateScheduleExceptionTimes,
} from "./index";

describe("schedule exception validation", () => {
	test("normalizes date to UTC midnight", () => {
		const result = normalizeScheduleExceptionDate(
			new Date("2026-08-19T15:32:10.000Z"),
		);

		expect(result.toISOString()).toBe("2026-08-19T00:00:00.000Z");
	});

test("allows full day off without times", () => {
		const type: ScheduleExceptionType = "DAY_OFF";

		expect(() =>
			validateScheduleExceptionTimes({
				type,
			}),
		).not.toThrow();
	});

	test("requires both times together for partial day off", () => {
		const type: ScheduleExceptionType = "DAY_OFF";

		expect(() =>
			validateScheduleExceptionTimes({
				type,
				startTime: "09:00",
			}),
		).toThrow("Start time and end time must be provided together");
	});

	test("requires times for time block", () => {
		const type: ScheduleExceptionType = "TIME_BLOCK";

		expect(() =>
			validateScheduleExceptionTimes({
				type,
				startTime: null,
				endTime: null,
			}),
		).toThrow("Start time and end time are required for this exception type");
	});

	test("rejects end time before start time", () => {
		const type: ScheduleExceptionType = "SPECIAL_HOURS";

		expect(() =>
			validateScheduleExceptionTimes({
				type,
				startTime: "14:00",
				endTime: "09:00",
			}),
		).toThrow("End time must be after start time");
	});
});
