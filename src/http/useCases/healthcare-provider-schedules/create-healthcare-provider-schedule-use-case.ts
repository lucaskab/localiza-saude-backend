import type {
	CreateScheduleData,
	ScheduleWithProvider,
} from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-contract";
import { prismaHealthcareProviderScheduleRepository } from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-implementation";
import { clinicRbac } from "@/http/services/clinic-rbac";
import type { user } from "../../../../prisma/generated/prisma/client";

export const createHealthcareProviderScheduleUseCase = {
	async execute(
		currentUser: user,
		data: CreateScheduleData,
	): Promise<{ schedule: ScheduleWithProvider }> {
		await clinicRbac.assertCanManageProvider(
			currentUser,
			data.healthcareProviderId,
			"MANAGE_PROVIDER_SCHEDULE",
		);

		const schedule =
			await prismaHealthcareProviderScheduleRepository.create(data);

		return { schedule };
	},
};
