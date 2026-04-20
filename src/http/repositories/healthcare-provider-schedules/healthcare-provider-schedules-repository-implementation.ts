import { prisma } from "@/database/prisma";
import type {
	CreateScheduleData,
	HealthcareProviderScheduleRepository,
	ScheduleWithProvider,
	UpdateScheduleData,
} from "./healthcare-provider-schedules-repository-contract";

export const prismaHealthcareProviderScheduleRepository: HealthcareProviderScheduleRepository =
	{
		async findAll() {
			const schedules = await prisma.healthcare_provider_schedule.findMany({
				include: {
					healthcareProvider: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									phone: true,
									image: true,
									role: true,
								},
							},
						},
					},
				},
				orderBy: [
					{
						dayOfWeek: "asc",
					},
					{
						startTime: "asc",
					},
				],
			});

			return schedules as ScheduleWithProvider[];
		},

		async findById(id: string) {
			const schedule = await prisma.healthcare_provider_schedule.findUnique({
				where: { id },
				include: {
					healthcareProvider: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									phone: true,
									image: true,
									role: true,
								},
							},
						},
					},
				},
			});

			return schedule as ScheduleWithProvider | null;
		},

		async findByProviderId(healthcareProviderId: string) {
			const schedules = await prisma.healthcare_provider_schedule.findMany({
				where: {
					healthcareProviderId,
				},
				include: {
					healthcareProvider: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									phone: true,
									image: true,
									role: true,
								},
							},
						},
					},
				},
				orderBy: [
					{
						dayOfWeek: "asc",
					},
					{
						startTime: "asc",
					},
				],
			});

			return schedules as ScheduleWithProvider[];
		},

		async create(data: CreateScheduleData) {
			const schedule = await prisma.healthcare_provider_schedule.create({
				data: {
					healthcareProviderId: data.healthcareProviderId,
					dayOfWeek: data.dayOfWeek,
					startTime: data.startTime,
					endTime: data.endTime,
				},
				include: {
					healthcareProvider: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									phone: true,
									image: true,
									role: true,
								},
							},
						},
					},
				},
			});

			return schedule as ScheduleWithProvider;
		},

		async update(id: string, data: UpdateScheduleData) {
			const schedule = await prisma.healthcare_provider_schedule.update({
				where: { id },
				data: {
					...(data.dayOfWeek !== undefined && { dayOfWeek: data.dayOfWeek }),
					...(data.startTime !== undefined && { startTime: data.startTime }),
					...(data.endTime !== undefined && { endTime: data.endTime }),
					...(data.isActive !== undefined && { isActive: data.isActive }),
				},
				include: {
					healthcareProvider: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									phone: true,
									image: true,
									role: true,
								},
							},
						},
					},
				},
			});

			return schedule as ScheduleWithProvider;
		},

		async delete(id: string) {
			await prisma.healthcare_provider_schedule.delete({
				where: { id },
			});
		},
	};
