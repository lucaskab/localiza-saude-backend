import type { AppointmentWithRelations } from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";

export const getAppointmentsByCustomerUseCase = {
	async execute(
		customerId: string,
	): Promise<{ appointments: AppointmentWithRelations[] }> {
		const appointments =
			await prismaAppointmentRepository.findByCustomerId(customerId);

		return { appointments };
	},
};
