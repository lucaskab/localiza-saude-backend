import type { ScheduleExceptionWithProvider } from "@/http/repositories/healthcare-provider-schedule-exceptions/healthcare-provider-schedule-exceptions-repository-contract";
import { prismaHealthcareProviderScheduleExceptionRepository } from "@/http/repositories/healthcare-provider-schedule-exceptions/healthcare-provider-schedule-exceptions-repository-implementation";

type GetScheduleExceptionsParams = {
	healthcareProviderId: string;
	from?: string;
	to?: string;
};

function parseDate(date?: string): Date | undefined {
	if (!date) {
		return undefined;
	}

	const [year, month, day] = date.split("-").map(Number);
	return new Date(Date.UTC(year || 0, (month || 1) - 1, day || 1));
}

export const getScheduleExceptionsByHealthcareProviderUseCase = {
	async execute({
		healthcareProviderId,
		from,
		to,
	}: GetScheduleExceptionsParams): Promise<{
		exceptions: ScheduleExceptionWithProvider[];
	}> {
		const exceptions =
			await prismaHealthcareProviderScheduleExceptionRepository.findByHealthcareProviderId(
				healthcareProviderId,
				{
					from: parseDate(from),
					to: parseDate(to),
				},
			);

		return { exceptions };
	},
};
