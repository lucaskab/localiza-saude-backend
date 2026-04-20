import type { ScheduleWithProvider } from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-contract";
import { prismaHealthcareProviderScheduleRepository } from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-implementation";

export const getHealthcareProviderScheduleByIdUseCase = {
	async execute(id: string): Promise<{ schedule: ScheduleWithProvider }> {
		const schedule =
			await prismaHealthcareProviderScheduleRepository.findById(id);

		if (!schedule) {
			throw new Error("Healthcare provider schedule not found");
		}

		return { schedule };
	},
};
