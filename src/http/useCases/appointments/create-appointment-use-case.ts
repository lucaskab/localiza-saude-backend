import { prisma } from "@/database/prisma";
import type {
	AppointmentWithRelations,
	CreateAppointmentData,
} from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

export const createAppointmentUseCase = {
	async execute(
		data: CreateAppointmentData,
	): Promise<{ appointment: AppointmentWithRelations }> {
		// Validate healthcare provider exists
		const healthcareProvider = await prisma.healthcare_provider.findUnique({
			where: { id: data.healthcareProviderId },
		});

		if (!healthcareProvider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		const appointment = await prismaAppointmentRepository.create(data);

		return { appointment };
	},
};
