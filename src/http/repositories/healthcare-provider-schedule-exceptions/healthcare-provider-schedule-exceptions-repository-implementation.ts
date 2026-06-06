import { prisma } from "@/database/prisma";
import type {
	CreateScheduleExceptionData,
	HealthcareProviderScheduleExceptionRepository,
	ScheduleExceptionWithProvider,
	UpdateScheduleExceptionData,
} from "./healthcare-provider-schedule-exceptions-repository-contract";

const scheduleExceptionInclude = {
	healthcareProvider: {
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			image: true,
			role: true,
		},
	},
};

function normalizeDateToUtcDay(value: Date) {
	const result = new Date(value);
	result.setUTCHours(0, 0, 0, 0);
	return result;
}

function getScheduleExceptionEndDate(
	exception: ScheduleExceptionWithProvider,
) {
	return exception.endDate ?? exception.date;
}

function matchesRange(
	exception: ScheduleExceptionWithProvider,
	range?: { from?: Date; to?: Date },
) {
	if (!range?.from && !range?.to) {
		return true;
	}

	const exceptionStart = normalizeDateToUtcDay(exception.date);
	const exceptionEnd = normalizeDateToUtcDay(getScheduleExceptionEndDate(exception));
	const rangeStart = range.from ? normalizeDateToUtcDay(range.from) : undefined;
	const rangeEnd = range.to ? normalizeDateToUtcDay(range.to) : undefined;

	if (rangeStart && exceptionEnd < rangeStart) {
		return false;
	}

	if (rangeEnd && exceptionStart > rangeEnd) {
		return false;
	}

	return true;
}

export const prismaHealthcareProviderScheduleExceptionRepository: HealthcareProviderScheduleExceptionRepository =
	{
		async findById(id) {
			const exception =
				await prisma.healthcare_provider_schedule_exception.findUnique({
					where: { id },
					include: scheduleExceptionInclude,
				});

			return exception as ScheduleExceptionWithProvider | null;
		},

		async findByHealthcareProviderId(healthcareProviderId, range) {
			const exceptions =
				await prisma.healthcare_provider_schedule_exception.findMany({
					where: { healthcareProviderId },
					include: scheduleExceptionInclude,
					orderBy: [
						{
							date: "asc",
						},
						{
							startTime: "asc",
						},
					],
				});

			return exceptions.filter((exception) =>
				matchesRange(exception as ScheduleExceptionWithProvider, range),
			) as ScheduleExceptionWithProvider[];
		},

		async create(data: CreateScheduleExceptionData) {
			const exception =
				await prisma.healthcare_provider_schedule_exception.create({
					data: {
						healthcareProviderId: data.healthcareProviderId,
						date: data.startDate,
						endDate: data.endDate ?? data.startDate,
						type: data.type,
						startTime: data.startTime,
						endTime: data.endTime,
						reason: data.reason,
					},
					include: scheduleExceptionInclude,
				});

			return exception as ScheduleExceptionWithProvider;
		},

		async update(id, data: UpdateScheduleExceptionData) {
			const exception =
				await prisma.healthcare_provider_schedule_exception.update({
					where: { id },
					data: {
						...(data.startDate !== undefined && { date: data.startDate }),
						...(data.endDate !== undefined && { endDate: data.endDate }),
						...(data.type !== undefined && { type: data.type }),
						...(data.startTime !== undefined && {
							startTime: data.startTime,
						}),
						...(data.endTime !== undefined && { endTime: data.endTime }),
						...(data.reason !== undefined && { reason: data.reason }),
						...(data.isActive !== undefined && { isActive: data.isActive }),
					},
					include: scheduleExceptionInclude,
				});

			return exception as ScheduleExceptionWithProvider;
		},

		async delete(id) {
			await prisma.healthcare_provider_schedule_exception.delete({
				where: { id },
			});
		},
	};
