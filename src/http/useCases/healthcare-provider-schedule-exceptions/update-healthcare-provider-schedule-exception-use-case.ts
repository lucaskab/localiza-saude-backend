import type {
	ScheduleExceptionWithProvider,
	UpdateScheduleExceptionData,
} from "@/http/repositories/healthcare-provider-schedule-exceptions/healthcare-provider-schedule-exceptions-repository-contract";
import { prismaHealthcareProviderScheduleExceptionRepository } from "@/http/repositories/healthcare-provider-schedule-exceptions/healthcare-provider-schedule-exceptions-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import type { user } from "../../../../prisma/generated/prisma/client";
import {
	normalizeScheduleExceptionEndDate,
	normalizeScheduleExceptionDate,
	validateScheduleExceptionPeriod,
	validateScheduleExceptionTimes,
} from "./schedule-exception-validation";

export const updateHealthcareProviderScheduleExceptionUseCase = {
	async execute(
		currentUser: user,
		id: string,
		data: UpdateScheduleExceptionData,
	): Promise<{ exception: ScheduleExceptionWithProvider }> {
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

		const nextType = data.type ?? existingException.type;
		const nextStartDate =
			data.startDate ?? existingException.date;
		const nextEndDate =
			data.endDate ??
			existingException.endDate ??
			(data.startDate ?? existingException.date);
		const nextStartTime =
			data.startTime !== undefined ? data.startTime : existingException.startTime;
		const nextEndTime =
			data.endTime !== undefined ? data.endTime : existingException.endTime;

		validateScheduleExceptionPeriod({
			startDate: nextStartDate,
			endDate: nextEndDate,
		});
		validateScheduleExceptionTimes({
			type: nextType,
			startTime: nextStartTime,
			endTime: nextEndTime,
		});

		const exception =
			await prismaHealthcareProviderScheduleExceptionRepository.update(id, {
				...data,
				...(data.startDate !== undefined && {
					startDate: normalizeScheduleExceptionDate(data.startDate),
				}),
				...(data.endDate !== undefined && {
					endDate: normalizeScheduleExceptionEndDate(
						data.endDate,
						data.startDate ?? existingException.date,
					),
				}),
			});

		return { exception };
	},
};
