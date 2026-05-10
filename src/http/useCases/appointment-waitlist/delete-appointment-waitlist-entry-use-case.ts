import { prismaAppointmentWaitlistRepository } from "@/http/repositories/appointment-waitlist/appointment-waitlist-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import type { user } from "../../../../prisma/generated/prisma/client";

export const deleteAppointmentWaitlistEntryUseCase = {
	async execute(currentUser: user, id: string): Promise<void> {
		const waitlistEntry = await prismaAppointmentWaitlistRepository.findById(id);

		if (!waitlistEntry) {
			throw new BadRequestError("Waitlist entry not found");
		}

		if (waitlistEntry.customerId !== currentUser.id && currentUser.role !== "ADMIN") {
			throw new UnauthorizedError("You cannot leave this waitlist entry");
		}

		await prismaAppointmentWaitlistRepository.cancel(id);
	},
};
