import type {
	healthcare_provider,
	healthcare_provider_schedule,
	user,
} from "../../../../prisma/generated/prisma/client";

export type CreateScheduleData = {
	healthcareProviderId: string;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
};

export type UpdateScheduleData = {
	dayOfWeek?: number;
	startTime?: string;
	endTime?: string;
	isActive?: boolean;
};

export type ScheduleWithProvider = healthcare_provider_schedule & {
	healthcareProvider: healthcare_provider & {
		user: user;
	};
};

export type HealthcareProviderScheduleRepository = {
	findAll: () => Promise<ScheduleWithProvider[]>;
	findById: (id: string) => Promise<ScheduleWithProvider | null>;
	findByProviderId: (
		healthcareProviderId: string,
	) => Promise<ScheduleWithProvider[]>;
	create: (data: CreateScheduleData) => Promise<ScheduleWithProvider>;
	update: (
		id: string,
		data: UpdateScheduleData,
	) => Promise<ScheduleWithProvider>;
	delete: (id: string) => Promise<void>;
};
