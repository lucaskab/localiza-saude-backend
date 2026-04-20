import { prismaHealthcareProviderScheduleRepository } from "@/http/repositories/healthcare-provider-schedules/healthcare-provider-schedules-repository-implementation";

export const deleteHealthcareProviderScheduleUseCase = {
	async execute(id: string): Promise<void> {
		await prismaHealthcareProviderScheduleRepository.delete(id);
	},
};
