import type {
	healthcare_provider_schedule_exception,
	ScheduleExceptionType,
	user,
} from "../../../../prisma/generated/prisma/client";

export type CreateScheduleExceptionData = {
	healthcareProviderId: string;
	startDate: Date;
	endDate?: Date | null;
	type: ScheduleExceptionType;
	startTime?: string | null;
	endTime?: string | null;
	reason?: string | null;
};

export type UpdateScheduleExceptionData = {
	startDate?: Date;
	endDate?: Date | null;
	type?: ScheduleExceptionType;
	startTime?: string | null;
	endTime?: string | null;
	reason?: string | null;
	isActive?: boolean;
};

export type ScheduleExceptionWithProvider =
	healthcare_provider_schedule_exception & {
		healthcareProvider: user;
	};

export type ScheduleExceptionRange = {
	from?: Date;
	to?: Date;
};

export type HealthcareProviderScheduleExceptionRepository = {
	findById: (id: string) => Promise<ScheduleExceptionWithProvider | null>;
	findByHealthcareProviderId: (
		healthcareProviderId: string,
		range?: ScheduleExceptionRange,
	) => Promise<ScheduleExceptionWithProvider[]>;
	create: (
		data: CreateScheduleExceptionData,
	) => Promise<ScheduleExceptionWithProvider>;
	update: (
		id: string,
		data: UpdateScheduleExceptionData,
	) => Promise<ScheduleExceptionWithProvider>;
	delete: (id: string) => Promise<void>;
};
