import { prismaHealthcareProviderScheduleRepository } from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import type { user } from "../../../../prisma/generated/prisma/client";

export const deleteHealthcareProviderScheduleUseCase = {
	async execute(currentUser: user, id: string): Promise<void> {
		const existingSchedule =
			await prismaHealthcareProviderScheduleRepository.findById(id);

		if (!existingSchedule) {
			throw new BadRequestError("Schedule not found");
		}

		await clinicRbac.assertCanManageProvider(
			currentUser,
			existingSchedule.healthcareProviderId,
			"MANAGE_PROVIDER_SCHEDULE",
		);

		await prismaHealthcareProviderScheduleRepository.delete(id);
	},
};
