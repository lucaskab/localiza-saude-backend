import type {
	AppointmentWithRelations,
	FindAppointmentsFilters,
} from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";

export const getAppointmentsUseCase = {
	async execute(filters?: FindAppointmentsFilters): Promise<{
		appointments: AppointmentWithRelations[];
	}> {
		const appointments = await prismaAppointmentRepository.findAll(filters);

		return { appointments };
	},
};
