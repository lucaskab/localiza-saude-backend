import type { ScheduleExceptionType } from "../../../../prisma/generated/prisma/client";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

type ScheduleExceptionData = {
	type: ScheduleExceptionType;
	startTime?: string | null;
	endTime?: string | null;
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
