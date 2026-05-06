import type {
	FindAppointmentsResult,
	FindAppointmentsFilters,
} from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";

export const getAppointmentsUseCase = {
	async execute(filters?: FindAppointmentsFilters): Promise<FindAppointmentsResult> {
		return prismaAppointmentRepository.findAll(filters);
	},
};
