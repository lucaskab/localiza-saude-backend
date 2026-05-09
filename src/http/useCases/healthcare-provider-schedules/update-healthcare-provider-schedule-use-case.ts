import type {
	ScheduleWithProvider,
	UpdateScheduleData,
} from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-contract";
import { prismaHealthcareProviderScheduleRepository } from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import type { user } from "../../../../prisma/generated/prisma/client";

export const updateHealthcareProviderScheduleUseCase = {
	async execute(
		currentUser: user,
		id: string,
		data: UpdateScheduleData,
	): Promise<{ schedule: ScheduleWithProvider }> {
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

		const schedule = await prismaHealthcareProviderScheduleRepository.update(
			id,
			data,
		);

		return { schedule };
	},
};
