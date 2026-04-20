import type {
	CreateScheduleData,
	ScheduleWithProvider,
} from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-contract";
import { prismaHealthcareProviderScheduleRepository } from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-implementation";

export const createHealthcareProviderScheduleUseCase = {
	async execute(
		data: CreateScheduleData,
	): Promise<{ schedule: ScheduleWithProvider }> {
		const schedule =
			await prismaHealthcareProviderScheduleRepository.create(data);

		return { schedule };
	},
};
