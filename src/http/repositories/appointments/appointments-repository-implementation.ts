import { prisma } from "@/database/prisma";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import type {
	AppointmentRepository,
	AppointmentWithRelations,
	CreateAppointmentData,
	DateRangeParams,
	FindAppointmentsFilters,
	UpdateAppointmentData,
} from "./appointments-repository-contract";

const includeRelations = {
	customer: true,
	patientProfile: true,
	healthcareProvider: true,
	appointmentProcedures: {
		include: {
			procedure: true,
		},
		orderBy: {
			createdAt: "desc" as const,
		},
	},
};

function buildWhereClause(filters?: FindAppointmentsFilters) {
	const whereClause: Prisma.appointmentWhereInput = {};

	if (filters?.customerId) {
		whereClause.customerId = filters.customerId;
	}

	if (filters?.healthcareProviderId) {
		whereClause.healthcareProviderId = filters.healthcareProviderId;
	}

	if (filters?.status) {
		whereClause.status = filters.status;
	}

	if (filters?.startDate || filters?.endDate) {
		whereClause.scheduledAt = {};
		if (filters.startDate) {
			whereClause.scheduledAt.gte = filters.startDate;
		}
		if (filters.endDate) {
			whereClause.scheduledAt.lte = filters.endDate;
		}
	}

	const search = filters?.search?.trim();
	if (search) {
		whereClause.OR = [
			{
				customer: {
					name: {
						contains: search,
						mode: "insensitive",
					},
				},
			},
			{
				healthcareProvider: {
					name: {
						contains: search,
						mode: "insensitive",
					},
				},
			},
			{
				patientProfile: {
					fullName: {
						contains: search,
						mode: "insensitive",
					},
				},
			},
			{
				appointmentProcedures: {
					some: {
						procedure: {
							name: {
								contains: search,
								mode: "insensitive",
							},
						},
					},
				},
			},
		];
	}

	return whereClause;
}

export const prismaAppointmentRepository: AppointmentRepository = {
	async findAll(filters?: FindAppointmentsFilters) {
		const whereClause = buildWhereClause(filters);
		const limit = filters?.limit ?? 20;
		const offset = filters?.offset ?? 0;

		const [appointments, total] = await Promise.all([
			prisma.appointment.findMany({
				where: whereClause,
				include: includeRelations,
				orderBy: {
					scheduledAt: "desc",
				},
				take: limit,
				skip: offset,
			}),
			prisma.appointment.count({ where: whereClause }),
		]);

		return {
			appointments: appointments as AppointmentWithRelations[],
			total,
			limit,
			offset,
			hasMore: offset + appointments.length < total,
		};
	},

	async findById(id: string) {
		const appointment = await prisma.appointment.findUnique({
			where: { id },
			include: includeRelations,
		});

		return appointment as AppointmentWithRelations | null;
	},

	async findByUserId(customerId: string) {
		const appointments = await prisma.appointment.findMany({
			where: { customerId },
			include: includeRelations,
			orderBy: {
				scheduledAt: "desc",
			},
		});

		return appointments as AppointmentWithRelations[];
	},

	async findByHealthcareProviderId(healthcareProviderId: string) {
		const appointments = await prisma.appointment.findMany({
			where: { healthcareProviderId },
			include: includeRelations,
			orderBy: {
				scheduledAt: "desc",
			},
		});

		return appointments as AppointmentWithRelations[];
	},

	async findByDateRange(params: DateRangeParams) {
		const appointments = await prisma.appointment.findMany({
			where: {
				scheduledAt: {
					gte: params.startDate,
					lte: params.endDate,
				},
			},
			include: includeRelations,
			orderBy: {
				scheduledAt: "asc",
			},
		});

		return appointments as AppointmentWithRelations[];
	},

	async findByProfessionalAndDateRange(
		healthcareProviderId: string,
		params: DateRangeParams,
	) {
		const appointments = await prisma.appointment.findMany({
			where: {
				healthcareProviderId,
				scheduledAt: {
					gte: params.startDate,
					lte: params.endDate,
				},
				status: {
					not: "CANCELLED",
				},
			},
			include: includeRelations,
			orderBy: {
				scheduledAt: "asc",
			},
		});

		return appointments as AppointmentWithRelations[];
	},

	async existsByCustomerAndProfessional(customerId: string, healthcareProviderId: string) {
		const appointment = await prisma.appointment.findFirst({
			where: {
				customerId,
				healthcareProviderId,
			},
			select: { id: true },
		});

		return Boolean(appointment);
	},

	async existsConfirmedByCustomerAndProfessional(
		customerId: string,
		healthcareProviderId: string,
	) {
		const appointment = await prisma.appointment.findFirst({
			where: {
				customerId,
				healthcareProviderId,
				status: "CONFIRMED",
			},
			select: { id: true },
		});

		return Boolean(appointment);
	},

	async existsByPatientProfileAndHealthcareProvider(
		patientProfileId: string,
		healthcareProviderId: string,
	) {
		const appointment = await prisma.appointment.findFirst({
			where: {
				patientProfileId,
				healthcareProviderId,
			},
			select: { id: true },
		});

		return Boolean(appointment);
	},

	async create(data: CreateAppointmentData) {
		const procedures = await prisma.procedure.findMany({
			where: {
				id: {
					in: data.procedureIds,
				},
			},
		});

		const totalDurationMinutes = procedures.reduce(
			(sum, procedure) => sum + procedure.durationInMinutes,
			0,
		);
		const totalPriceCents = procedures.reduce(
			(sum, procedure) => sum + procedure.priceInCents,
			0,
		);

		const appointment = await prisma.appointment.create({
			data: {
				customerId: data.customerId,
				patientProfileId: data.patientProfileId,
				healthcareProviderId: data.healthcareProviderId,
				scheduledAt: data.scheduledAt,
				serviceModality: data.serviceModality,
				notes: data.notes,
				totalDurationMinutes,
				totalPriceCents,
				status: data.status ?? "SCHEDULED",
				appointmentProcedures: {
					create: data.procedureIds.map((procedureId) => ({
						procedureId,
					})),
				},
			},
			include: includeRelations,
		});

		return appointment as AppointmentWithRelations;
	},

	async update(id: string, data: UpdateAppointmentData) {
		const appointment = await prisma.appointment.update({
			where: { id },
			data: {
				...(data.scheduledAt !== undefined && {
					scheduledAt: data.scheduledAt,
				}),
				...(data.status !== undefined && { status: data.status }),
				...(data.notes !== undefined && { notes: data.notes }),
				...(data.onlineMeetingUrl !== undefined && {
					onlineMeetingUrl: data.onlineMeetingUrl,
				}),
				...(data.onlineMeetingProvider !== undefined && {
					onlineMeetingProvider: data.onlineMeetingProvider,
				}),
				...(data.onlineMeetingExternalId !== undefined && {
					onlineMeetingExternalId: data.onlineMeetingExternalId,
				}),
				...(data.onlineMeetingCreatedAt !== undefined && {
					onlineMeetingCreatedAt: data.onlineMeetingCreatedAt,
				}),
			},
			include: includeRelations,
		});

		return appointment as AppointmentWithRelations;
	},

	async delete(id: string) {
		await prisma.appointment.delete({
			where: { id },
		});
	},
};
