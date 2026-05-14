import { prisma } from "@/database/prisma";
import type { AppointmentWaitlistEntryWithRelations } from "@/http/repositories/appointment-waitlist/appointment-waitlist-repository-contract";
import { prismaAppointmentWaitlistRepository } from "@/http/repositories/appointment-waitlist/appointment-waitlist-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type { user } from "../../../../../prisma/generated/prisma/client";

type CreateAppointmentWaitlistEntryData = {
	healthcareProviderId: string;
	scheduledAt: Date;
	procedureIds: string[];
};

export const createAppointmentWaitlistEntryUseCase = {
	async execute(
		currentUser: user,
		data: CreateAppointmentWaitlistEntryData,
	): Promise<{ waitlistEntry: AppointmentWaitlistEntryWithRelations }> {
		if (currentUser.role !== "CUSTOMER") {
			throw new BadRequestError("Only customers can join the waitlist");
		}

		if (data.scheduledAt <= new Date()) {
			throw new BadRequestError("Past slots cannot be added to the waitlist");
		}

		const procedures = await prisma.procedure.findMany({
			where: {
				id: {
					in: data.procedureIds,
				},
				healthcareProviderId: data.healthcareProviderId,
			},
		});

		if (procedures.length !== data.procedureIds.length) {
			throw new BadRequestError(
				"One or more procedures do not belong to this provider",
			);
		}

		const waitlistEntry = await prismaAppointmentWaitlistRepository.upsertActive({
			customerId: currentUser.id,
			healthcareProviderId: data.healthcareProviderId,
			desiredScheduledAt: data.scheduledAt,
			procedureIds: data.procedureIds,
		});

		return { waitlistEntry };
	},
};
