import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";

export const deleteAppointmentUseCase = {
	async execute(id: string): Promise<{ message: string }> {
		await prismaAppointmentRepository.delete(id);

		return { message: "Appointment deleted successfully" };
	},
};
