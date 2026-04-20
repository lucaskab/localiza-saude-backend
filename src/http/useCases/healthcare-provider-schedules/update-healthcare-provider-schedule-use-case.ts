import type {
	ScheduleWithProvider,
	UpdateScheduleData,
} from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-contract";
import { prismaHealthcareProviderScheduleRepository } from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-implementation";

export const updateHealthcareProviderScheduleUseCase = {
	async execute(
		id: string,
		data: UpdateScheduleData,
	): Promise<{ schedule: ScheduleWithProvider }> {
		const schedule = await prismaHealthcareProviderScheduleRepository.update(
			id,
			data,
		);

		return { schedule };
	},
};
