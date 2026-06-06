import type {
	CreateScheduleExceptionData,
	ScheduleExceptionWithProvider,
} from "@/http/repositories/healthcare-provider-schedule-exceptions/healthcare-provider-schedule-exceptions-repository-contract";
import { prismaHealthcareProviderScheduleExceptionRepository } from "@/http/repositories/healthcare-provider-schedule-exceptions/healthcare-provider-schedule-exceptions-repository-implementation";
import { clinicRbac } from "@/http/services/clinic-rbac";
import type { user } from "../../../../prisma/generated/prisma/client";
import {
	normalizeScheduleExceptionEndDate,
	normalizeScheduleExceptionDate,
	validateScheduleExceptionPeriod,
	validateScheduleExceptionTimes,
} from "./schedule-exception-validation";

export const createHealthcareProviderScheduleExceptionUseCase = {
	async execute(
		currentUser: user,
		data: CreateScheduleExceptionData,
		): Promise<{ exception: ScheduleExceptionWithProvider }> {
		await clinicRbac.assertCanManageProvider(
			currentUser,
			data.healthcareProviderId,
			"MANAGE_PROVIDER_SCHEDULE",
		);

		validateScheduleExceptionTimes(data);
		validateScheduleExceptionPeriod({
			startDate: data.startDate,
			endDate: data.endDate,
		});

		const exception =
			await prismaHealthcareProviderScheduleExceptionRepository.create({
				...data,
				startDate: normalizeScheduleExceptionDate(data.startDate),
				endDate: normalizeScheduleExceptionEndDate(
					data.endDate,
					data.startDate,
				),
			});

		return { exception };
	},
};
