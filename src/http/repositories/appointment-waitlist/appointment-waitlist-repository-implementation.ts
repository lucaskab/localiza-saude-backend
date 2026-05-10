import { prisma } from "@/database/prisma";
import type {
	AppointmentWaitlistEntryWithRelations,
	AppointmentWaitlistRepository,
	CreateAppointmentWaitlistEntryData,
} from "./appointment-waitlist-repository-contract";

const includeRelations = {
	customer: true,
	healthcareProvider: true,
	procedures: {
		include: {
			procedure: true,
		},
	},
};

export const prismaAppointmentWaitlistRepository: AppointmentWaitlistRepository =
	{
		async findById(id) {
			const entry = await prisma.appointment_waitlist_entry.findUnique({
				where: { id },
				include: includeRelations,
			});

			return entry as AppointmentWaitlistEntryWithRelations | null;
		},

		async findBySlotAndCustomer(
			healthcareProviderId,
			customerId,
			desiredScheduledAt,
		) {
			const entry = await prisma.appointment_waitlist_entry.findUnique({
				where: {
					customerId_healthcareProviderId_desiredScheduledAt: {
						customerId,
						healthcareProviderId,
						desiredScheduledAt,
					},
				},
				include: includeRelations,
			});

			return entry as AppointmentWaitlistEntryWithRelations | null;
		},

		async upsertActive(data: CreateAppointmentWaitlistEntryData) {
			const entry = await prisma.appointment_waitlist_entry.upsert({
				where: {
					customerId_healthcareProviderId_desiredScheduledAt: {
						customerId: data.customerId,
						healthcareProviderId: data.healthcareProviderId,
						desiredScheduledAt: data.desiredScheduledAt,
					},
				},
				create: {
					customerId: data.customerId,
					healthcareProviderId: data.healthcareProviderId,
					desiredScheduledAt: data.desiredScheduledAt,
					procedures: {
						create: data.procedureIds.map((procedureId) => ({
							procedureId,
						})),
					},
				},
				update: {
					status: "ACTIVE",
					procedures: {
						deleteMany: {},
						create: data.procedureIds.map((procedureId) => ({
							procedureId,
						})),
					},
				},
				include: includeRelations,
			});

			return entry as AppointmentWaitlistEntryWithRelations;
		},

		async cancel(id) {
			const entry = await prisma.appointment_waitlist_entry.update({
				where: { id },
				data: { status: "CANCELLED" },
				include: includeRelations,
			});

			return entry as AppointmentWaitlistEntryWithRelations;
		},

		async findMatchingForCancelledAppointment(appointment) {
			const entries = await prisma.appointment_waitlist_entry.findMany({
				where: {
					healthcareProviderId: appointment.healthcareProviderId,
					status: "ACTIVE",
					desiredScheduledAt: appointment.scheduledAt,
				},
				include: includeRelations,
				orderBy: {
					createdAt: "asc",
				},
			});

			return entries as AppointmentWaitlistEntryWithRelations[];
		},

		async markNotified(id) {
			await prisma.appointment_waitlist_entry.update({
				where: { id },
				data: {
					lastNotifiedAt: new Date(),
				},
			});
		},
	};
