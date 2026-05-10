import { prismaAppointmentWaitlistRepository } from "@/http/repositories/appointment-waitlist/appointment-waitlist-repository-implementation";
import type { AppointmentWaitlistEntryWithRelations } from "@/http/repositories/appointment-waitlist/appointment-waitlist-repository-contract";
import type { user } from "../../../../prisma/generated/prisma/client";

type GetAppointmentWaitlistEntryData = {
	healthcareProviderId: string;
	scheduledAt: Date;
};

export const getAppointmentWaitlistEntryUseCase = {
	async execute(
		currentUser: user,
		data: GetAppointmentWaitlistEntryData,
	): Promise<{ waitlistEntry: AppointmentWaitlistEntryWithRelations | null }> {
		const waitlistEntry =
			await prismaAppointmentWaitlistRepository.findBySlotAndCustomer(
				data.healthcareProviderId,
				currentUser.id,
				data.scheduledAt,
			);

		return { waitlistEntry };
	},
};
