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
					where: {
						healthcareProviderId,
						...(range?.from || range?.to
							? {
									date: {
										...(range.from ? { gte: range.from } : {}),
										...(range.to ? { lte: range.to } : {}),
									},
								}
							: {}),
					},
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

			return exceptions as ScheduleExceptionWithProvider[];
		},

		async create(data: CreateScheduleExceptionData) {
			const exception =
				await prisma.healthcare_provider_schedule_exception.create({
					data: {
						healthcareProviderId: data.healthcareProviderId,
						date: data.date,
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
						...(data.date !== undefined && { date: data.date }),
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
