import type { ScheduleWithProvider } from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-contract";
import { prismaHealthcareProviderScheduleRepository } from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-implementation";

export const getHealthcareProviderSchedulesUseCase = {
	async execute(): Promise<{ schedules: ScheduleWithProvider[] }> {
		const schedules =
			await prismaHealthcareProviderScheduleRepository.findAll();

		return { schedules };
	},
};
