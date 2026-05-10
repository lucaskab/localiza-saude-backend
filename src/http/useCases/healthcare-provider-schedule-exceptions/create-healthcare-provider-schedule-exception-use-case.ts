import type {
	CreateScheduleExceptionData,
	ScheduleExceptionWithProvider,
} from "@/http/repositories/healthcare-provider-schedule-exceptions/healthcare-provider-schedule-exceptions-repository-contract";
import { prismaHealthcareProviderScheduleExceptionRepository } from "@/http/repositories/healthcare-provider-schedule-exceptions/healthcare-provider-schedule-exceptions-repository-implementation";
import { clinicRbac } from "@/http/services/clinic-rbac";
import type { user } from "../../../../prisma/generated/prisma/client";
import {
	normalizeScheduleExceptionDate,
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

		const exception =
			await prismaHealthcareProviderScheduleExceptionRepository.create({
				...data,
				date: normalizeScheduleExceptionDate(data.date),
				startTime: data.type === "DAY_OFF" ? null : data.startTime,
				endTime: data.type === "DAY_OFF" ? null : data.endTime,
			});

		return { exception };
	},
};
