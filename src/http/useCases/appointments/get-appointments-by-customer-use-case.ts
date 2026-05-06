import type {
	FindAppointmentsFilters,
	FindAppointmentsResult,
} from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";

export const getAppointmentsByCustomerUseCase = {
	async execute(
		customerId: string,
		filters?: Omit<FindAppointmentsFilters, "customerId">,
	): Promise<FindAppointmentsResult> {
		return prismaAppointmentRepository.findAll({
			...filters,
			customerId,
		});
	},
};
