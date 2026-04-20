import type { ScheduleWithProvider } from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-contract";
import { prismaHealthcareProviderScheduleRepository } from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-implementation";

export const getSchedulesByProviderUseCase = {
	async execute(
		healthcareProviderId: string,
	): Promise<{ schedules: ScheduleWithProvider[] }> {
		const schedules =
			await prismaHealthcareProviderScheduleRepository.findByProviderId(
				healthcareProviderId,
			);

		return { schedules };
	},
};
