import { prismaHealthcareProviderScheduleExceptionRepository } from "@/http/repositories/healthcare-provider-schedule-exceptions/healthcare-provider-schedule-exceptions-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import type { user } from "../../../../prisma/generated/prisma/client";

export const deleteHealthcareProviderScheduleExceptionUseCase = {
	async execute(currentUser: user, id: string): Promise<void> {
		const existingException =
			await prismaHealthcareProviderScheduleExceptionRepository.findById(id);

		if (!existingException) {
			throw new BadRequestError("Schedule exception not found");
		}

		await clinicRbac.assertCanManageProvider(
			currentUser,
			existingException.healthcareProviderId,
			"MANAGE_PROVIDER_SCHEDULE",
		);

		await prismaHealthcareProviderScheduleExceptionRepository.delete(id);
	},
};
