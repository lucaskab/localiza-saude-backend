import type {
	ScheduleExceptionWithProvider,
	UpdateScheduleExceptionData,
} from "@/http/repositories/healthcare-provider-schedule-exceptions/healthcare-provider-schedule-exceptions-repository-contract";
import { prismaHealthcareProviderScheduleExceptionRepository } from "@/http/repositories/healthcare-provider-schedule-exceptions/healthcare-provider-schedule-exceptions-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import type { user } from "../../../../prisma/generated/prisma/client";
import {
	normalizeScheduleExceptionDate,
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
		const nextStartTime =
			data.startTime !== undefined ? data.startTime : existingException.startTime;
		const nextEndTime =
			data.endTime !== undefined ? data.endTime : existingException.endTime;

		validateScheduleExceptionTimes({
			type: nextType,
			startTime: nextStartTime,
			endTime: nextEndTime,
		});

		const exception =
			await prismaHealthcareProviderScheduleExceptionRepository.update(id, {
				...data,
				...(data.date !== undefined && {
					date: normalizeScheduleExceptionDate(data.date),
				}),
				...(nextType === "DAY_OFF" && {
					startTime: null,
					endTime: null,
				}),
			});

		return { exception };
	},
};
