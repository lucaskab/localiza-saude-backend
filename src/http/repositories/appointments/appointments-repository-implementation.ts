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
	customer: {
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
	patientProfile: true,
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
	appointmentProcedures: {
		include: {
			procedure: true,
		},
		orderBy: {
			createdAt: "desc" as const,
		},
	},
};

export const prismaAppointmentRepository: AppointmentRepository = {
	async findAll(filters?: FindAppointmentsFilters) {
		const whereClause: Prisma.appointmentWhereInput = {};

		if (filters?.healthcareProviderId) {
			whereClause.healthcareProviderId = filters.healthcareProviderId;
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

		const appointments = await prisma.appointment.findMany({
			where: whereClause,
			include: includeRelations,
			orderBy: {
				scheduledAt: "desc",
			},
		});

		return appointments as AppointmentWithRelations[];
	},

	async findById(id: string) {
		const appointment = await prisma.appointment.findUnique({
			where: { id },
			include: includeRelations,
		});

		return appointment as AppointmentWithRelations | null;
	},

	async findByCustomerId(customerId: string) {
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

	async findByProviderAndDateRange(
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

	async existsByCustomerAndProvider(customerId: string, healthcareProviderId: string) {
		const appointment = await prisma.appointment.findFirst({
			where: {
				customerId,
				healthcareProviderId,
			},
			select: { id: true },
		});

		return Boolean(appointment);
	},

	async existsConfirmedByCustomerAndProvider(
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

	async existsByPatientProfileAndProvider(
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
