import type { AppointmentWithRelations } from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";

export const getAppointmentByIdUseCase = {
	async execute(
		id: string,
	): Promise<{ appointment: AppointmentWithRelations | null }> {
		const appointment = await prismaAppointmentRepository.findById(id);

		return { appointment };
	},
};
