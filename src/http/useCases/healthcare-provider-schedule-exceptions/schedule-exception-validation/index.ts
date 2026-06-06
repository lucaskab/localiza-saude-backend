import type { ScheduleExceptionType } from "../../../../../prisma/generated/prisma/client";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

const MAX_SCHEDULE_EXCEPTION_PERIOD_DAYS = 180;

type ScheduleExceptionData = {
	type: ScheduleExceptionType;
	startTime?: string | null;
	endTime?: string | null;
};

type ScheduleExceptionPeriodData = {
	startDate: Date;
	endDate?: Date | null;
};

export function normalizeScheduleExceptionDate(date: Date): Date {
	return new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);
}

function timeToMinutes(time: string): number {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

export function validateScheduleExceptionTimes(data: ScheduleExceptionData) {
	if (data.type === "DAY_OFF") {
		if (!data.startTime && !data.endTime) {
			return;
		}

		if (!data.startTime || !data.endTime) {
			throw new BadRequestError(
				"Start time and end time must be provided together",
			);
		}

		if (timeToMinutes(data.startTime) >= timeToMinutes(data.endTime)) {
			throw new BadRequestError("End time must be after start time");
		}

		return;
	}

	if (!data.startTime || !data.endTime) {
		throw new BadRequestError(
			"Start time and end time are required for this exception type",
		);
	}

	if (timeToMinutes(data.startTime) >= timeToMinutes(data.endTime)) {
		throw new BadRequestError("End time must be after start time");
	}
}

export function normalizeScheduleExceptionEndDate(
	date: Date | null | undefined,
	fallbackDate: Date,
) {
	if (!date) {
		return normalizeScheduleExceptionDate(fallbackDate);
	}

	return normalizeScheduleExceptionDate(date);
}

export function validateScheduleExceptionPeriod(
	data: ScheduleExceptionPeriodData,
) {
	const startTime = normalizeScheduleExceptionDate(data.startDate).getTime();
	const endTime = normalizeScheduleExceptionEndDate(
		data.endDate,
		data.startDate,
	).getTime();

	if (endTime < startTime) {
		throw new BadRequestError("End date must be after or equal to start date");
	}

	const periodDays =
		Math.floor((endTime - startTime) / (24 * 60 * 60 * 1000)) + 1;

	if (periodDays > MAX_SCHEDULE_EXCEPTION_PERIOD_DAYS) {
		throw new BadRequestError("Schedule exception period cannot exceed 180 days");
	}
}
