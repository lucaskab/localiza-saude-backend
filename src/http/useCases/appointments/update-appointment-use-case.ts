import type {
	AppointmentWithRelations,
	UpdateAppointmentData,
} from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";

export const updateAppointmentUseCase = {
	async execute(
		id: string,
		data: UpdateAppointmentData,
	): Promise<{ appointment: AppointmentWithRelations }> {
		const appointment = await prismaAppointmentRepository.update(id, data);

		return { appointment };
	},
};
